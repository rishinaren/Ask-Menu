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

      // Vector similarity search for the specific restaurant
      const vectorResults = await db.query(`
        SELECT content, (1 - (embedding <=> $1::vector)) as similarity
        FROM menu_chunks
        WHERE restaurant_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT 5
      `, [JSON.stringify(questionEmbedding), restaurantId])

      // Full-text search for the specific restaurant
      const ftsResults = await db.query(`
        SELECT content, ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
        FROM menu_chunks
        WHERE restaurant_id = $2 AND to_tsvector('english', content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 5
      `, [question, restaurantId])

      menuChunks = [...vectorResults.rows, ...ftsResults.rows]
    } else {
      // Multi-restaurant mode: search across all restaurants
      // Vector similarity search across all restaurants
      const vectorResults = await db.query(`
        SELECT mc.content, r.name as restaurant_name, (1 - (mc.embedding <=> $1::vector)) as similarity
        FROM menu_chunks mc
        JOIN restaurants r ON mc.restaurant_id = r.id
        ORDER BY mc.embedding <=> $1::vector
        LIMIT 10
      `, [JSON.stringify(questionEmbedding)])

      // Full-text search across all restaurants
      const ftsResults = await db.query(`
        SELECT mc.content, r.name as restaurant_name, ts_rank_cd(to_tsvector('english', mc.content), plainto_tsquery('english', $1)) as rank
        FROM menu_chunks mc
        JOIN restaurants r ON mc.restaurant_id = r.id
        WHERE to_tsvector('english', mc.content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT 10
      `)

      menuChunks = [...vectorResults.rows, ...ftsResults.rows]
    }

    if (menuChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant menu information to answer your question. Please try rephrasing or upload more menu data."
      })
    }

    // Remove duplicates and format context
    const uniqueChunks = Array.from(
      new Map(menuChunks.map(chunk => [chunk.content, chunk])).values()
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
