import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params

    const events = await prisma.pBPEvent.findMany({
      where: { gameId },
      orderBy: { sequenceNumber: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching play-by-play:', error)
    return NextResponse.json(
      { error: 'Failed to fetch play-by-play events' },
      { status: 500 }
    )
  }
}
