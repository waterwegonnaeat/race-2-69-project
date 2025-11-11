import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ teams: [] })
    }

    // Search for teams in games (home and away)
    const homeTeams = await prisma.game.findMany({
      where: {
        homeTeamName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        homeTeamId: true,
        homeTeamName: true,
        homeConference: true,
        league: true,
      },
      distinct: ['homeTeamId'],
      take: 10,
    })

    const awayTeams = await prisma.game.findMany({
      where: {
        awayTeamName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        awayTeamId: true,
        awayTeamName: true,
        awayConference: true,
        league: true,
      },
      distinct: ['awayTeamId'],
      take: 10,
    })

    // Combine and deduplicate teams
    const teamsMap = new Map()

    homeTeams.forEach(game => {
      teamsMap.set(game.homeTeamId, {
        teamId: game.homeTeamId,
        teamName: game.homeTeamName,
        conference: game.homeConference,
        league: game.league,
      })
    })

    awayTeams.forEach(game => {
      if (!teamsMap.has(game.awayTeamId)) {
        teamsMap.set(game.awayTeamId, {
          teamId: game.awayTeamId,
          teamName: game.awayTeamName,
          conference: game.awayConference,
          league: game.league,
        })
      }
    })

    const teams = Array.from(teamsMap.values()).slice(0, 10)

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Error searching teams:', error)
    return NextResponse.json(
      { error: 'Failed to search teams' },
      { status: 500 }
    )
  }
}
