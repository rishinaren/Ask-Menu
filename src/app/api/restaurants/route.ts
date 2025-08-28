import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const result = db.query(`
      SELECT 
        r.id,
        r.name,
        COUNT(mc.id) as chunk_count
      FROM restaurants r
      LEFT JOIN menu_chunks mc ON r.id = mc.restaurant_id
      GROUP BY r.id, r.name
      ORDER BY r.created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Restaurants fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
