import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { League } from '@/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Teams with R69W% >= 69%
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const league = searchParams.get('league') as League | null
    const season = searchParams.get('season') || '2024-25'
    const minGames = parseInt(searchParams.get('minGames') || '10')

    // Build where clause
    const where: any = { season }
    if (league) where.league = league

    // Fetch teams
    const teams = await prisma.team.findMany({
      where,
    })

    // Filter for 69 Club members
    const club69Members = teams
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
          r69Attempts: totalR69Games,
          r69Wins: team.r69Wins,
          r69WinPct,
          avgTTo69: team.avgTTo69 ? Number(team.avgTTo69) : 0,
          avgMarginAt69: team.avgMarginAt69 ? Number(team.avgMarginAt69) : 0,
        }
      })
      .filter(team =>
        team.r69Attempts >= minGames && team.r69WinPct >= 69.0
      )
      .sort((a, b) => b.r69WinPct - a.r69WinPct)

    return NextResponse.json({ club69Members })
  } catch (error) {
    console.error('Error fetching 69 Club:', error)
    return NextResponse.json(
      { error: 'Failed to fetch 69 Club members' },
      { status: 500 }
    )
  }
}
