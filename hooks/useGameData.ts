import { useQuery } from '@tanstack/react-query'
import { Game, PBPEvent, R69Event, GameStatus } from '@/types'

export function useGame(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}`)
      if (!response.ok) throw new Error('Failed to fetch game')
      return response.json() as Promise<Game>
    },
    refetchInterval: (query) => {
      // Auto-refresh if game is live
      return query.state.data?.gameStatus === GameStatus.IN_PROGRESS ? 10000 : false
    },
  })
}

export function usePlayByPlay(gameId: string) {
  return useQuery({
    queryKey: ['pbp', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}/pbp`)
      if (!response.ok) throw new Error('Failed to fetch play-by-play')
      const data = await response.json()
      return data.events as PBPEvent[]
    },
  })
}

export function useR69Event(gameId: string) {
  return useQuery({
    queryKey: ['r69', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}/r69`)
      if (!response.ok) throw new Error('Failed to fetch R69 event')
      const data = await response.json()
      return data.r69Event as R69Event | null
    },
  })
}

export function useGameStream(gameId: string, onUpdate: (data: any) => void) {
  return useQuery({
    queryKey: ['game-stream', gameId],
    queryFn: async () => {
      const eventSource = new EventSource(`/api/games/${gameId}/stream`)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        onUpdate(data)
      }

      eventSource.onerror = () => {
        eventSource.close()
      }

      return () => eventSource.close()
    },
    enabled: false, // Manual control
  })
}
