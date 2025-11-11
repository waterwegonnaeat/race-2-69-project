import { useQuery } from '@tanstack/react-query'
import { Game, GameFilters, GamesResponse, GameStatus } from '@/types'

interface UseGamesOptions extends GameFilters {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useGames(options: UseGamesOptions = {}) {
  return useQuery({
    queryKey: ['games', options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.league) params.set('league', options.league)
      if (options.conference) params.set('conference', options.conference)
      if (options.status) params.set('status', options.status)
      if (options.gameType) params.set('gameType', options.gameType)
      if (options.dateFrom) params.set('dateFrom', options.dateFrom.toString())
      if (options.dateTo) params.set('dateTo', options.dateTo.toString())
      if (options.teamId) params.set('teamId', options.teamId)
      if (options.page) params.set('page', options.page.toString())
      if (options.pageSize) params.set('pageSize', options.pageSize.toString())
      if (options.sortBy) params.set('sortBy', options.sortBy)
      if (options.sortOrder) params.set('sortOrder', options.sortOrder)

      const response = await fetch(`/api/games?${params}`)
      if (!response.ok) throw new Error('Failed to fetch games')

      return response.json() as Promise<GamesResponse>
    },
    refetchInterval: options.status === GameStatus.IN_PROGRESS ? 10000 : false, // Auto-refresh live games
  })
}

export function useTodaysGames(league?: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return useGames({
    dateFrom: today.toISOString(),
    dateTo: tomorrow.toISOString(),
    league: league as any,
    sortBy: 'gameDate',
    sortOrder: 'asc',
  })
}

export function useLiveGames(league?: string) {
  return useGames({
    status: GameStatus.IN_PROGRESS,
    league: league as any,
  })
}
