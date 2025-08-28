import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateEmbeddings } from '@/lib/embeddings'
import { askClaude } from '@/lib/claude'

const AskSchema = z.object({
  question: z.string().min(1),
  mode: z.enum(['single', 'multi']).optional().default('multi'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Ask request body:', body)
    
    const { question, mode } = AskSchema.parse(body)
    console.log('Parsed question:', question, 'mode:', mode)

    // Generate embedding for the question
    const questionEmbedding = generateEmbeddings(question)
    console.log('Generated embedding length:', questionEmbedding.length)

    let menuChunks: any[]

    if (mode === 'single') {
      // Get chunks from the most recently uploaded restaurant
      console.log('Fetching recent restaurant...')
      const recentRestaurant = await db.query(`
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

      const restaurantId = recentRestaurant.rows[0].id
      console.log('Using restaurant ID:', restaurantId)

      // Temporarily skip vector search and only use full-text search
      console.log('Performing full-text search...')
      const ftsResults = await db.query(`
        SELECT content, ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
        FROM menu_chunks
        WHERE restaurant_id = $2 AND to_tsvector('english', content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 5
      `, [question, restaurantId])

      console.log('FTS results count:', ftsResults.rows.length)
      
      // If no FTS results, get any chunks from this restaurant
      if (ftsResults.rows.length === 0) {
        console.log('No FTS results, getting any chunks from restaurant...')
        const anyResults = await db.query(`
          SELECT content, 0.5 as rank
          FROM menu_chunks
          WHERE restaurant_id = $1
          LIMIT 5
        `, [restaurantId])
        console.log('Any results count:', anyResults.rows.length)
        menuChunks = anyResults.rows
      } else {
        menuChunks = ftsResults.rows
      }
    } else {
      // Multi-restaurant mode: search across all restaurants
      console.log('Performing multi-restaurant full-text search...')
      const ftsResults = await db.query(`
        SELECT mc.content, r.name as restaurant_name, ts_rank_cd(to_tsvector('english', mc.content), plainto_tsquery('english', $1)) as rank
        FROM menu_chunks mc
        JOIN restaurants r ON mc.restaurant_id = r.id
        WHERE to_tsvector('english', mc.content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 10
      `, [question])

      console.log('Multi FTS results count:', ftsResults.rows.length)
      
      // If no FTS results, get any chunks from all restaurants
      if (ftsResults.rows.length === 0) {
        console.log('No FTS results, getting any chunks from all restaurants...')
        const anyResults = await db.query(`
          SELECT mc.content, r.name as restaurant_name, 0.5 as rank
          FROM menu_chunks mc
          JOIN restaurants r ON mc.restaurant_id = r.id
          LIMIT 10
        `)
        console.log('Any results count:', anyResults.rows.length)
        menuChunks = anyResults.rows
      } else {
        menuChunks = ftsResults.rows
      }
    }

    console.log('Total menu chunks found:', menuChunks.length)

    if (menuChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant menu information to answer your question. Please try rephrasing or upload more menu data."
      })
    }

    // Simple keyword-based filtering for relevance
    const questionWords = question.toLowerCase().split(/\s+/)
    const relevantChunks = menuChunks.filter(chunk => {
      const content = (chunk as any).content.toLowerCase()
      return questionWords.some(word => content.includes(word))
    })

    // Use relevant chunks if found, otherwise use all chunks (but limit)
    const chunksToUse = relevantChunks.length > 0 ? relevantChunks : menuChunks.slice(0, 8)

    // Remove duplicates and format context
    const uniqueChunks = Array.from(
      new Map(chunksToUse.map(chunk => [(chunk as any).content, chunk])).values()
    )

    const context = uniqueChunks
      .slice(0, 8) // Limit context to prevent token overflow
      .map(chunk => {
        if ((chunk as any).restaurant_name) {
          return `${(chunk as any).restaurant_name}: ${(chunk as any).content}`
        }
        return (chunk as any).content
      })
      .join('\n\n')

    console.log('Context length:', context.length)

    // Get answer from Claude
    console.log('Calling Claude...')
    const answer = await askClaude(question, context, mode)
    console.log('Claude response received, length:', answer.length)

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
