import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { League } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const league = searchParams.get('league') as League | null
    const conference = searchParams.get('conference')
    const season = searchParams.get('season') || '2024-25'
    const minGames = parseInt(searchParams.get('minGames') || '5')
    const sortBy = searchParams.get('sortBy') || 'r69WinPct'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const where: any = { season }
    if (league) where.league = league
    if (conference) where.conference = conference

    // Fetch teams with R69 stats
    const teams = await prisma.team.findMany({
      where,
    })

    // Calculate R69 win percentage and filter by min games
    const leaderboard = teams
      .map(team => {
        const totalR69Games = team.r69Wins + team.r69Losses
        const r69WinPct = totalR69Games > 0
          ? Number(((team.r69Wins / totalR69Games) * 100).toFixed(2))
          : 0

        return {
          teamId: team.teamId,
          teamName: team.teamName,
          conference: team.conference,
          league: team.league,
          gamesPlayed: team.gamesPlayed,
          r69Wins: team.r69Wins,
          r69Losses: team.r69Losses,
          r69WinPct,
          avgTTo69: team.avgTTo69 ? Number(team.avgTTo69) : 0,
          avgMarginAt69: team.avgMarginAt69 ? Number(team.avgMarginAt69) : 0,
        }
      })
      .filter(team => team.gamesPlayed >= minGames)

    // Sort leaderboard
    leaderboard.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || 0
      const bVal = b[sortBy as keyof typeof b] || 0

      if (sortOrder === 'desc') {
        return Number(bVal) - Number(aVal)
      } else {
        return Number(aVal) - Number(bVal)
      }
    })

    // Add rank
    const rankedLeaderboard = leaderboard.map((team, index) => ({
      ...team,
      rank: index + 1,
    }))

    return NextResponse.json({ leaderboard: rankedLeaderboard })
  } catch (error) {
    console.error('Error fetching team leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team leaderboard' },
      { status: 500 }
    )
  }
}
