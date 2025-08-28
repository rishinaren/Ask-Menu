import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateEmbeddings } from '@/lib/embeddings'

const UploadSchema = z.object({
  restaurantName: z.string().min(1),
  menuText: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantName, menuText } = UploadSchema.parse(body)

    // Check if restaurant exists
    const existingRestaurant = db.query(
      'SELECT id FROM restaurants WHERE name = ?',
      [restaurantName]
    )

    let restaurantId: number
    if (existingRestaurant.rows.length > 0) {
      restaurantId = (existingRestaurant.rows[0] as any).id
    } else {
      // Create new restaurant
      const newRestaurant = db.query(
        'INSERT INTO restaurants (name) VALUES (?)',
        [restaurantName]
      )
      restaurantId = (newRestaurant.rows[0] as any).id
    }

    // Split menu text into chunks
    const chunks = menuText
      .split(/\n\s*\n/)
      .filter(chunk => chunk.trim().length > 20)
      .map(chunk => chunk.trim())

    // Process each chunk
    for (const chunk of chunks) {
      const embedding = generateEmbeddings(chunk)
      
      db.query(
        'INSERT INTO menu_chunks (restaurant_id, content, embedding) VALUES (?, ?, ?)',
        [restaurantId, chunk, JSON.stringify(embedding)]
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Uploaded ${chunks.length} menu sections for ${restaurantName}` 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload menu' },
      { status: 500 }
    )
  }
}
