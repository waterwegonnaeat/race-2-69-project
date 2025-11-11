import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Server-Sent Events endpoint for real-time game updates
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  const { gameId } = params

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial game state
      try {
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          include: {
            r69Events: true,
            analytics: true,
          },
        })

        if (game) {
          const data = `data: ${JSON.stringify({
            type: 'game_update',
            gameId: game.id,
            data: game,
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      } catch (error) {
        console.error('Error fetching game:', error)
      }

      // Poll for updates every 10 seconds
      const interval = setInterval(async () => {
        try {
          const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
              r69Events: true,
              analytics: true,
            },
          })

          if (game) {
            const data = `data: ${JSON.stringify({
              type: 'game_update',
              gameId: game.id,
              data: {
                homeScore: game.homeScore,
                awayScore: game.awayScore,
                gameStatus: game.gameStatus,
                r69Event: game.r69Events[0] || null,
              },
              timestamp: new Date().toISOString(),
            })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        } catch (error) {
          console.error('Error in stream:', error)
        }
      }, 10000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
