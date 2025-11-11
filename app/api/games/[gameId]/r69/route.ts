import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params

    const r69Event = await prisma.r69Event.findFirst({
      where: { gameId },
    })

    if (!r69Event) {
      return NextResponse.json(
        { r69Event: null, message: 'No R69 event for this game' },
        { status: 200 }
      )
    }

    return NextResponse.json({ r69Event })
  } catch (error) {
    console.error('Error fetching R69 event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch R69 event' },
      { status: 500 }
    )
  }
}
