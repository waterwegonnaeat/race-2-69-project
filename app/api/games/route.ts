import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GameStatus, League, GameType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse filters
    const league = searchParams.get('league') as League | null
    const conference = searchParams.get('conference')
    const status = searchParams.get('status') as GameStatus | null
    const gameType = searchParams.get('gameType') as GameType | null
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const teamId = searchParams.get('teamId')

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const sortBy = searchParams.get('sortBy') || 'gameDate'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const where: any = {}

    if (league) where.league = league
    if (conference) {
      where.OR = [
        { homeConference: conference },
        { awayConference: conference },
      ]
    }
    if (status) where.gameStatus = status
    if (gameType) where.gameType = gameType
    if (teamId) {
      where.OR = [
        { homeTeamId: teamId },
        { awayTeamId: teamId },
      ]
    }
    if (dateFrom || dateTo) {
      where.gameDate = {}
      if (dateFrom) where.gameDate.gte = new Date(dateFrom)
      if (dateTo) where.gameDate.lte = new Date(dateTo)
    }

    // Execute query
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          r69Events: true,
          analytics: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.game.count({ where }),
    ])

    // Format response
    const formattedGames = games.map(game => ({
      ...game,
      homeScore: game.homeScore || 0,
      awayScore: game.awayScore || 0,
      r69Event: game.r69Events[0] || null,
    }))

    return NextResponse.json({
      games: formattedGames,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
