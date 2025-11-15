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

    return NextResponse.json(
      {
        seasons: seasonList,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
