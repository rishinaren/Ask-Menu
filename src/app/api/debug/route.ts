import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db-simple'

export async function GET(request: NextRequest) {
  try {
    const debug = dbQuery.getDebugInfo()
    return NextResponse.json(debug)
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
