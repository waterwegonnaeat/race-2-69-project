import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const tests = {
    connection: false,
    databaseUrl: false,
    gamesCount: 0,
    sampleGame: null,
    teamsCount: 0,
    sampleTeams: [],
    error: null as string | null,
  }

  try {
    // Test 1: Check if DATABASE_URL is set
    tests.databaseUrl = !!process.env.DATABASE_URL

    if (!tests.databaseUrl) {
      tests.error = 'DATABASE_URL environment variable is not set'
      return NextResponse.json(tests, { status: 503 })
    }

    // Test 2: Try to connect to database
    await prisma.$connect()
    tests.connection = true

    // Test 3: Count games
    tests.gamesCount = await prisma.game.count()

    // Test 4: Get a sample game
    const sampleGame = await prisma.game.findFirst({
      select: {
        id: true,
        gameId: true,
        homeTeamName: true,
        awayTeamName: true,
        gameDate: true,
        league: true,
      },
    })
    tests.sampleGame = sampleGame

    // Test 5: Get distinct team names (simulating search)
    const games = await prisma.game.findMany({
      select: {
        homeTeamId: true,
        homeTeamName: true,
        awayTeamId: true,
        awayTeamName: true,
      },
      take: 10,
    })

    // Extract unique teams
    const teamsSet = new Set<string>()
    games.forEach(game => {
      teamsSet.add(game.homeTeamName)
      teamsSet.add(game.awayTeamName)
    })
    tests.sampleTeams = Array.from(teamsSet).slice(0, 5)
    tests.teamsCount = teamsSet.size

    // Test 6: Test search query
    const searchTest = await prisma.game.findMany({
      where: {
        OR: [
          {
            homeTeamName: {
              contains: 'Duke',
              mode: 'insensitive',
            },
          },
          {
            awayTeamName: {
              contains: 'Duke',
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 1,
    })

    return NextResponse.json({
      ...tests,
      success: true,
      searchTest: {
        found: searchTest.length > 0,
        sample: searchTest[0] || null,
      },
      message: 'Database connection successful!',
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    tests.error = errorMessage

    return NextResponse.json({
      ...tests,
      success: false,
      errorDetails: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
