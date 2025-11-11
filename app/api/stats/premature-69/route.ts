import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { League } from '@/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Hall of Shame - Teams that hit 69 first but lost
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const league = searchParams.get('league') as League | null
    const season = searchParams.get('season') || '2024-25'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    // Build where clause
    const where: any = {
      r69w: false, // Lost after hitting 69 first
      game: {
        season,
        gameStatus: 'FINAL',
      },
    }
    if (league) where.game = { ...where.game, league }

    // Fetch premature 69 events
    const [events, total] = await Promise.all([
      prisma.r69Event.findMany({
        where,
        include: {
          game: true,
        },
        orderBy: [
          { marginAt69: 'desc' }, // Biggest blown leads first
          { game: { gameDate: 'desc' } },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.r69Event.count({ where }),
    ])

    // Format response
    const prematureGames = events.map(r69Event => {
      const game = r69Event.game
      const opponentName = r69Event.teamId === game.homeTeamId
        ? game.awayTeamName
        : game.homeTeamName

      return {
        game,
        r69Event,
        blowDetails: {
          maxLead: r69Event.marginAt69,
          leadLostAt: r69Event.tTo69,
          finalMargin: r69Event.finalMargin || 0,
        },
        opponentName,
      }
    })

    return NextResponse.json({
      prematureGames,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching Premature69 hall of shame:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Premature69 games' },
      { status: 500 }
    )
  }
}
