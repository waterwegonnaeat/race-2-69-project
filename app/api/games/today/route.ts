import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const conference = searchParams.get('conference')
    const r69Status = searchParams.get('r69Status') || 'all'

    // Get today's games
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Build where clause
    const where: any = {
      gameDate: {
        gte: today,
        lt: tomorrow,
      },
    }

    if (status !== 'all') {
      where.gameStatus = status
    }

    if (conference) {
      where.OR = [
        { homeTeam: { conference } },
        { awayTeam: { conference } },
      ]
    }

    // Fetch games
    const games = await prisma.game.findMany({
      where,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            displayName: true,
            abbreviation: true,
            conference: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            displayName: true,
            abbreviation: true,
            conference: true,
            logoUrl: true,
          },
        },
        r69Events: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
        playByPlay: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { gameStatus: 'asc' },
        { gameDate: 'desc' },
      ],
    })

    // Filter by R69 status
    let filteredGames = games
    if (r69Status !== 'all') {
      filteredGames = games.filter(game => {
        const hasR69 = game.r69Events.length > 0
        const homeScore = game.homeScore || 0
        const awayScore = game.awayScore || 0
        const near69 = homeScore >= 62 || awayScore >= 62

        switch (r69Status) {
          case 'reached':
            return hasR69
          case 'near':
            return near69 && !hasR69
          case 'not-reached':
            return !hasR69 && !near69
          default:
            return true
        }
      })
    }

    // Transform games for frontend
    const transformedGames = filteredGames.map(game => {
      const r69Event = game.r69Events[0]
      const homeScore = game.homeScore || 0
      const awayScore = game.awayScore || 0

      return {
        id: game.id,
        espnId: game.espnId,
        homeTeam: game.homeTeam?.displayName || 'Home',
        homeTeamId: game.homeTeamId,
        homeScore,
        homeRecord: null, // TODO: Add team record
        awayTeam: game.awayTeam?.displayName || 'Away',
        awayTeamId: game.awayTeamId,
        awayScore,
        awayRecord: null, // TODO: Add team record
        status: game.gameStatus,
        period: game.period,
        clock: game.clock,
        gameDate: game.gameDate,
        startTime: game.gameDate?.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        conference: game.homeTeam?.conference || game.awayTeam?.conference,
        r69Event: r69Event ? {
          teamId: r69Event.teamId,
          period: r69Event.period,
          clock: r69Event.clock,
          score: r69Event.score,
        } : null,
        pace: null, // TODO: Calculate pace
        leadChanges: null, // TODO: Calculate lead changes
        viewers: Math.floor(Math.random() * 10000) + 1000, // Mock data
      }
    })

    // Calculate stats
    const stats = {
      totalGames: transformedGames.length,
      liveGames: transformedGames.filter(g => g.status === 'live').length,
      r69EventsToday: transformedGames.filter(g => g.r69Event).length,
      winRate: 73.2, // TODO: Calculate actual win rate
      avgTimeTo69: '22:34', // TODO: Calculate actual average
      hotStreaks: 8, // TODO: Calculate actual hot streaks
      excitementScore: 87, // TODO: Calculate actual excitement score
      totalViewers: '24.5K', // TODO: Calculate actual viewers
      hotGames: transformedGames.filter(g => {
        const scoreDiff = Math.abs(g.homeScore - g.awayScore)
        return scoreDiff <= 5 && g.status === 'live'
      }).length,
    }

    return NextResponse.json({
      games: transformedGames,
      stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching today\'s games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
