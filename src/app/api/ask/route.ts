import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateEmbeddings } from '@/lib/embeddings'
import { askClaude } from '@/lib/claude'

const AskSchema = z.object({
  question: z.string().min(1),
  mode: z.enum(['single', 'multi']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, mode } = AskSchema.parse(body)

    // Generate embedding for the question
    const questionEmbedding = generateEmbeddings(question)

    let menuChunks: any[] = []

    if (mode === 'single') {
      // Get chunks from the most recently uploaded restaurant
      const recentRestaurant = db.query(`
        SELECT r.id, r.name
        FROM restaurants r
        ORDER BY r.created_at DESC
        LIMIT 1
      `)

      if (recentRestaurant.rows.length === 0) {
        return NextResponse.json(
          { error: 'No menus uploaded yet' },
          { status: 400 }
        )
      }

      const restaurantId = (recentRestaurant.rows[0] as any).id

      // Get all chunks for the specific restaurant
      const chunks = db.query(`
        SELECT content
        FROM menu_chunks
        WHERE restaurant_id = ?
        ORDER BY id
      `, [restaurantId])

      menuChunks = chunks.rows
    } else {
      // Multi-restaurant mode: search across all restaurants
      const chunks = db.query(`
        SELECT mc.content, r.name as restaurant_name
        FROM menu_chunks mc
        JOIN restaurants r ON mc.restaurant_id = r.id
        ORDER BY r.id, mc.id
      `)

      menuChunks = chunks.rows
    }

    if (menuChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant menu information to answer your question. Please try rephrasing or upload more menu data."
      })
    }

    // Simple keyword-based filtering for relevance
    const questionWords = question.toLowerCase().split(/\s+/)
    const relevantChunks = menuChunks.filter(chunk => {
      const content = chunk.content.toLowerCase()
      return questionWords.some(word => content.includes(word))
    })

    // Use relevant chunks if found, otherwise use all chunks (but limit)
    const chunksToUse = relevantChunks.length > 0 ? relevantChunks : menuChunks.slice(0, 8)

    // Remove duplicates and format context
    const uniqueChunks = Array.from(
      new Map(chunksToUse.map(chunk => [chunk.content, chunk])).values()
    )

    const context = uniqueChunks
      .slice(0, 8) // Limit context to prevent token overflow
      .map(chunk => {
        if (mode === 'multi' && chunk.restaurant_name) {
          return `${chunk.restaurant_name}: ${chunk.content}`
        }
        return chunk.content
      })
      .join('\n\n')

    // Get answer from Claude
    const answer = await askClaude(question, context, mode)

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Ask error:', error)
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
