import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dbQuery } from '@/lib/db-file'
import { generateEmbeddings } from '@/lib/embeddings'

const UploadSchema = z.object({
  restaurantName: z.string().min(1),
  menuText: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Upload request body:', body)
    
    const { restaurantName, menuText } = UploadSchema.parse(body)
    console.log('Parsed data:', { restaurantName, menuTextLength: menuText.length })

    // Check if restaurant exists
    console.log('Checking for existing restaurant...')
    const existingRestaurants = dbQuery.getRestaurants().filter((r: any) => r.name === restaurantName)

    let restaurantId: number
    if (existingRestaurants.length > 0) {
      restaurantId = existingRestaurants[0].id
      console.log('Found existing restaurant with ID:', restaurantId)
    } else {
      // Create new restaurant
      console.log('Creating new restaurant...')
      restaurantId = dbQuery.insertRestaurant(restaurantName)
      console.log('Created new restaurant with ID:', restaurantId)
    }

    // Split menu text into chunks
    const chunks = menuText
      .split(/\n\s*\n/)
      .filter(chunk => chunk.trim().length > 20)
      .map(chunk => chunk.trim())
    
    console.log('Processing', chunks.length, 'chunks')

    // Process each chunk
    for (const chunk of chunks) {
      console.log('Generating embeddings for chunk:', chunk.substring(0, 100) + '...')
      const embedding = generateEmbeddings(chunk)
      console.log('Generated embedding with length:', embedding.length)
      
      dbQuery.insertMenuItem(restaurantId, chunk, embedding)
      console.log('Inserted chunk successfully')
    }

    console.log('Upload completed successfully')
    return NextResponse.json({ 
      success: true, 
      message: `Uploaded ${chunks.length} menu sections for ${restaurantName}` 
    })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json(
      { error: 'Failed to upload menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
