import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || 'raz'

    console.log('[TEST] Searching for:', query)

    // Test 1: Can we connect to database?
    const gameCount = await prisma.game.count()
    console.log('[TEST] Total games in database:', gameCount)

    // Test 2: Can we query for Arkansas?
    const games = await prisma.game.findMany({
      where: {
        OR: [
          {
            homeTeamName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            awayTeamName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        homeTeamId: true,
        homeTeamName: true,
        awayTeamId: true,
        awayTeamName: true,
      },
      take: 10,
    })

    console.log('[TEST] Found games:', games.length)

    // Deduplicate teams
    const teamsMap = new Map()
    games.forEach(game => {
      if (game.homeTeamName.toLowerCase().includes(query.toLowerCase())) {
        if (!teamsMap.has(game.homeTeamId)) {
          teamsMap.set(game.homeTeamId, {
            teamId: game.homeTeamId,
            teamName: game.homeTeamName,
          })
        }
      }
      if (game.awayTeamName.toLowerCase().includes(query.toLowerCase())) {
        if (!teamsMap.has(game.awayTeamId)) {
          teamsMap.set(game.awayTeamId, {
            teamId: game.awayTeamId,
            teamName: game.awayTeamName,
          })
        }
      }
    })

    const teams = Array.from(teamsMap.values())
    console.log('[TEST] Unique teams:', teams.length, teams)

    return NextResponse.json({
      success: true,
      query,
      totalGames: gameCount,
      gamesFound: games.length,
      teamsFound: teams.length,
      teams,
      rawGames: games,
    })
  } catch (error) {
    console.error('[TEST] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
