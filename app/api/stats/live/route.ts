import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameId = searchParams.get('gameId')

    // Get current active games
    const liveGames = await prisma.game.findMany({
      where: {
        gameStatus: 'live',
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        r69Events: true,
      },
    })

    // Calculate overall stats
    const totalR69Events = await prisma.r69Event.count()
    const r69WithWin = await prisma.r69Event.count({
      where: {
        didWin: true,
      },
    })
    const winRate = totalR69Events > 0 ? ((r69WithWin / totalR69Events) * 100).toFixed(1) : '0.0'

    // Get recent R69 events
    const recentEvents = await prisma.r69Event.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        team: {
          select: {
            displayName: true,
          },
        },
        game: {
          select: {
            gameStatus: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    })

    const transformedEvents = recentEvents.map(event => {
      const timeDiff = Date.now() - event.createdAt.getTime()
      const minutesAgo = Math.floor(timeDiff / 60000)
      const timeStr = minutesAgo < 1 ? 'Just now' : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`

      let eventType = 'r69'
      let eventMessage = 'Reached 69 first!'

      if (event.game.gameStatus === 'final') {
        if (event.didWin) {
          eventType = 'win'
          eventMessage = 'Won after R69'
        } else {
          eventType = 'loss'
          eventMessage = 'Lost after R69'
        }
      }

      return {
        team: event.team?.displayName || 'Unknown',
        event: eventMessage,
        time: timeStr,
        type: eventType,
      }
    })

    // Calculate hot games (close games near 69)
    const hotGames = liveGames.filter(game => {
      const scoreDiff = Math.abs((game.homeScore || 0) - (game.awayScore || 0))
      const maxScore = Math.max(game.homeScore || 0, game.awayScore || 0)
      return scoreDiff <= 7 && maxScore >= 55
    }).length

    return NextResponse.json({
      activeGames: liveGames.length,
      winRate: parseFloat(winRate),
      hotGames,
      totalViewers: '24.5K', // Mock data - would need to integrate with actual viewer tracking
      recentEvents: transformedEvents,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching live stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live stats' },
      { status: 500 }
    )
  }
}
