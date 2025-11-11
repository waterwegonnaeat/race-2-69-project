import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        r69Events: true,
        analytics: true,
      },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Format response
    const formattedGame = {
      ...game,
      homeScore: game.homeScore || 0,
      awayScore: game.awayScore || 0,
      r69Event: game.r69Events[0] || null,
    }

    return NextResponse.json(formattedGame)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
