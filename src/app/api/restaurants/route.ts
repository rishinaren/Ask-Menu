import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db-file'

export async function GET() {
  try {
    const restaurants = dbQuery.getRestaurants()
    console.log('Fetched restaurants:', restaurants)
    
    // Add menu item count for each restaurant
    const restaurantsWithCounts = restaurants.map(restaurant => {
      const menuItems = dbQuery.getMenuItems(restaurant.id)
      return {
        id: restaurant.id,
        name: restaurant.name,
        chunk_count: menuItems.length
      }
    })

    return NextResponse.json({ restaurants: restaurantsWithCounts })
  } catch (error) {
    console.error('Restaurants fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
