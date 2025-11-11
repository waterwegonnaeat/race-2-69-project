import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { League } from '@/types'

// Games where a team scored exactly 69
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const league = searchParams.get('league') as League | null
    const season = searchParams.get('season') || '2024-25'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    // Build where clause
    const where: any = {
      season,
      gameStatus: 'FINAL',
      analytics: {
        OR: [
          { niceScore: true },
          { doubleNice: true },
        ],
      },
    }
    if (league) where.league = league

    // Fetch nice games
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          analytics: true,
          r69Events: true,
        },
        orderBy: { gameDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.game.count({ where }),
    ])

    // Format response
    const niceGames = games.map(game => {
      const niceTeams: string[] = []
      if (game.homeScore === 69) niceTeams.push(game.homeTeamName)
      if (game.awayScore === 69) niceTeams.push(game.awayTeamName)

      const niceType = game.analytics?.doubleNice
        ? 'double'
        : 'single'

      return {
        game,
        niceType,
        niceTeams,
      }
    })

    return NextResponse.json({
      niceGames,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching nice games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nice games' },
      { status: 500 }
    )
  }
}
