import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all distinct seasons from games
    const seasons = await prisma.game.findMany({
      select: {
        season: true,
      },
      distinct: ['season'],
      orderBy: {
        season: 'desc',
      },
    })

    const seasonList = seasons.map(s => s.season)

    return NextResponse.json({
      seasons: seasonList,
    })
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}
