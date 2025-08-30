import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dbQuery } from '@/lib/db-file'
import { generateEmbeddings } from '@/lib/embeddings'
import Anthropic from '@anthropic-ai/sdk'

const AskSchema = z.object({
  question: z.string().min(1),
  restaurants: z.array(z.string()).optional(),
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Simple cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log('Ask request body:', body)
    
    const { question, restaurants } = AskSchema.parse(body)
    console.log('Parsed question:', question)

    // Generate embedding for the question
    const questionEmbedding = generateEmbeddings(question)
    console.log('Generated question embedding')

    // Get all restaurants
    const allRestaurants = dbQuery.getRestaurants()
    console.log('Found restaurants:', allRestaurants.map(r => ({ id: r.id, name: r.name })))

    // Filter restaurants if specified
    const targetRestaurants = restaurants 
      ? allRestaurants.filter(r => restaurants.includes(r.name))
      : allRestaurants

    console.log('Target restaurants:', targetRestaurants.map(r => ({ id: r.id, name: r.name })))

    if (targetRestaurants.length === 0) {
      console.log('No target restaurants found!')
      return NextResponse.json({
        answer: "I don't have information about any restaurants yet. Please upload some menu data first!"
      })
    }

    // Collect all menu items from target restaurants
    let allMenuItems: Array<{
      content: string
      embedding: number[]
      restaurantName: string
      similarity: number
    }> = []

    for (const restaurant of targetRestaurants) {
      const menuItems = dbQuery.getMenuItems(restaurant.id)
      console.log(`Restaurant ${restaurant.name} (ID: ${restaurant.id}) has ${menuItems.length} menu items`)
      
      if (menuItems.length === 0) {
        console.log(`No menu items found for restaurant ${restaurant.name}`)
        continue
      }
      
      for (const item of menuItems) {
        console.log(`Processing menu item: ${item.content.substring(0, 100)}...`)
        const similarity = cosineSimilarity(questionEmbedding, item.embedding)
        allMenuItems.push({
          content: item.content,
          embedding: item.embedding,
          restaurantName: restaurant.name,
          similarity
        })
      }
    }

    // Sort by similarity and take top results
    allMenuItems.sort((a, b) => b.similarity - a.similarity)
    const topItems = allMenuItems.slice(0, 5) // Top 5 most relevant items
    
    console.log('Total menu items collected:', allMenuItems.length)
    console.log('Top relevant items:', topItems.map(item => ({
      restaurant: item.restaurantName,
      similarity: item.similarity,
      preview: item.content.substring(0, 100)
    })))

    if (allMenuItems.length === 0) {
      console.log('No menu items found for any restaurants!')
      return NextResponse.json({
        answer: `I can see you have restaurants (${targetRestaurants.map(r => r.name).join(', ')}) but I don't have any menu content for them yet. This might be because the menu upload didn't process correctly. Please try uploading the menu data again.`
      })
    }

    // Build context for Claude
    const context = topItems.map(item => 
      `Restaurant: ${item.restaurantName}\nMenu Content: ${item.content}`
    ).join('\n\n---\n\n')

    // Create prompt for Claude
    const prompt = `You are a helpful assistant that answers questions about restaurant menus. 

Here is the relevant menu information from the restaurants:

${context}

Question: ${question}

Please provide a helpful and accurate answer based on the menu information provided. If you can't find the specific information requested, say so clearly. Be conversational and friendly.`

    console.log('Sending request to Claude...')
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Sorry, I could not generate a response.'
    
    console.log('Received answer from Claude')
    
    return NextResponse.json({ 
      answer,
      sources: topItems.map(item => ({
        restaurant: item.restaurantName,
        similarity: Math.round(item.similarity * 100) / 100
      }))
    })
  } catch (error) {
    console.error('Ask error details:', error)
    return NextResponse.json(
      { error: 'Failed to process question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
