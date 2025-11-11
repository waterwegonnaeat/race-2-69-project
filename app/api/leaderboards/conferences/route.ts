import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { League } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const league = searchParams.get('league') as League | null
    const season = searchParams.get('season') || '2024-25'

    // Build where clause
    const where: any = {
      season,
      conference: { not: null },
    }
    if (league) where.league = league

    // Fetch teams grouped by conference
    const teams = await prisma.team.findMany({
      where,
      select: {
        conference: true,
        league: true,
        season: true,
        r69Wins: true,
        r69Losses: true,
        avgTTo69: true,
        avgMarginAt69: true,
      },
    })

    // Group by conference
    const conferenceMap = new Map<string, any>()

    teams.forEach(team => {
      if (!team.conference) return

      const key = `${team.conference}-${team.league}`

      if (!conferenceMap.has(key)) {
        conferenceMap.set(key, {
          conference: team.conference,
          league: team.league,
          season: team.season,
          teamsCount: 0,
          totalGames: 0,
          totalR69Wins: 0,
          totalR69Losses: 0,
          sumTTo69: 0,
          sumMarginAt69: 0,
          teamsWithR69: 0,
        })
      }

      const conf = conferenceMap.get(key)
      conf.teamsCount++

      const totalR69 = team.r69Wins + team.r69Losses
      conf.totalGames += totalR69
      conf.totalR69Wins += team.r69Wins
      conf.totalR69Losses += team.r69Losses

      if (team.avgTTo69) {
        conf.sumTTo69 += Number(team.avgTTo69)
        conf.teamsWithR69++
      }
      if (team.avgMarginAt69) {
        conf.sumMarginAt69 += Number(team.avgMarginAt69)
      }
    })

    // Calculate conference stats
    const conferenceStats = Array.from(conferenceMap.values()).map(conf => {
      const conferenceR69WPct = conf.totalGames > 0
        ? Number(((conf.totalR69Wins / conf.totalGames) * 100).toFixed(2))
        : 0

      const avgTTo69 = conf.teamsWithR69 > 0
        ? Number((conf.sumTTo69 / conf.teamsWithR69).toFixed(2))
        : 0

      const avgMarginAt69 = conf.teamsWithR69 > 0
        ? Number((conf.sumMarginAt69 / conf.teamsWithR69).toFixed(2))
        : 0

      return {
        conference: conf.conference,
        league: conf.league,
        season: conf.season,
        teamsCount: conf.teamsCount,
        totalGames: conf.totalGames,
        totalR69Wins: conf.totalR69Wins,
        conferenceR69WPct,
        avgTTo69,
        avgMarginAt69,
      }
    })

    // Sort by R69W percentage
    conferenceStats.sort((a, b) => b.conferenceR69WPct - a.conferenceR69WPct)

    return NextResponse.json({ conferences: conferenceStats })
  } catch (error) {
    console.error('Error fetching conference leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conference leaderboard' },
      { status: 500 }
    )
  }
}
