import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { teamName: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const seasons = searchParams.get('seasons')?.split(',').filter(Boolean) || []

    const teamName = decodeURIComponent(params.teamName)

    // Build where clause
    const where: any = {
      OR: [
        { homeTeamName: { equals: teamName, mode: 'insensitive' } },
        { awayTeamName: { equals: teamName, mode: 'insensitive' } },
      ],
    }

    // Add season filter if provided
    if (seasons.length > 0) {
      where.season = { in: seasons }
    }

    // Fetch games
    const games = await prisma.game.findMany({
      where,
      include: {
        r69Events: true,
      },
      orderBy: {
        gameDate: 'asc',
      },
    })

    // Transform the data to include only the relevant R69 event for the team
    const transformedGames = games.map(game => {
      // Find R69 event where this team hit 69 first
      const r69Event = game.r69Events.find(event =>
        event.teamName.toLowerCase() === teamName.toLowerCase()
      )

      return {
        ...game,
        r69Event: r69Event || null,
        r69Events: undefined, // Remove the array, keep only the single relevant event
      }
    })

    return NextResponse.json({
      success: true,
      teamName,
      seasons: seasons.length > 0 ? seasons : 'all',
      totalGames: transformedGames.length,
      games: transformedGames,
    })
  } catch (error) {
    console.error('Error fetching team games:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team games',
      },
      { status: 500 }
    )
  }
}
