import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds max for this endpoint

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || ''

    console.log('[TEAM_SEARCH] Query:', query, 'Length:', query.length)

    if (query.length < 2) {
      console.log('[TEAM_SEARCH] Query too short, returning empty')
      return NextResponse.json({ teams: [] })
    }

    console.log('[TEAM_SEARCH] Starting database query...')
    const dbStart = Date.now()

    // Use a single query with OR to get both home and away teams
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
        homeConference: true,
        awayTeamId: true,
        awayTeamName: true,
        awayConference: true,
        league: true,
      },
      take: 50, // Get more to ensure we have enough after deduplication
    })

    // Deduplicate teams using a Map
    const teamsMap = new Map()

    games.forEach(game => {
      // Add home team if name matches query
      if (game.homeTeamName.toLowerCase().includes(query.toLowerCase())) {
        if (!teamsMap.has(game.homeTeamId)) {
          teamsMap.set(game.homeTeamId, {
            teamId: game.homeTeamId,
            teamName: game.homeTeamName,
            conference: game.homeConference,
            league: game.league,
          })
        }
      }

      // Add away team if name matches query
      if (game.awayTeamName.toLowerCase().includes(query.toLowerCase())) {
        if (!teamsMap.has(game.awayTeamId)) {
          teamsMap.set(game.awayTeamId, {
            teamId: game.awayTeamId,
            teamName: game.awayTeamName,
            conference: game.awayConference,
            league: game.league,
          })
        }
      }
    })

    const dbEnd = Date.now()
    console.log('[TEAM_SEARCH] DB query completed in', dbEnd - dbStart, 'ms. Found', games.length, 'games')

    // Convert to array and limit to 10 results
    const teams = Array.from(teamsMap.values())
      .sort((a, b) => a.teamName.localeCompare(b.teamName))
      .slice(0, 10)

    const totalTime = Date.now() - startTime
    console.log('[TEAM_SEARCH] Returning', teams.length, 'teams. Total time:', totalTime, 'ms')
    console.log('[TEAM_SEARCH] Teams:', teams.map(t => t.teamName).join(', '))

    return NextResponse.json({ teams })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('[TEAM_SEARCH] Error after', totalTime, 'ms:', error)

    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('connect') || errorMessage.includes('database')) {
      return NextResponse.json(
        {
          error: 'Database not connected. Please add DATABASE_URL environment variable.',
          teams: []
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search teams', teams: [] },
      { status: 500 }
    )
  }
}
