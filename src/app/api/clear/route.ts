import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db-file'

export async function POST() {
  try {
    // Clear all restaurants and menu items
    await dbQuery.clearAll()
    
    return NextResponse.json({ 
      success: true, 
      message: 'All restaurant data cleared successfully' 
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}