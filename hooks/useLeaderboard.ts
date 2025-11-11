import { useQuery } from '@tanstack/react-query'
import { LeaderboardEntry, ConferenceStats, League } from '@/types'

interface UseLeaderboardOptions {
  league?: League
  conference?: string
  season?: string
  minGames?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useTeamLeaderboard(options: UseLeaderboardOptions = {}) {
  return useQuery({
    queryKey: ['leaderboard', 'teams', options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.league) params.set('league', options.league)
      if (options.conference) params.set('conference', options.conference)
      if (options.season) params.set('season', options.season)
      if (options.minGames) params.set('minGames', options.minGames.toString())
      if (options.sortBy) params.set('sortBy', options.sortBy)
      if (options.sortOrder) params.set('sortOrder', options.sortOrder)

      const response = await fetch(`/api/leaderboards/teams?${params}`)
      if (!response.ok) throw new Error('Failed to fetch team leaderboard')

      const data = await response.json()
      return data.leaderboard as LeaderboardEntry[]
    },
  })
}

export function useConferenceLeaderboard(options: { league?: League; season?: string } = {}) {
  return useQuery({
    queryKey: ['leaderboard', 'conferences', options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.league) params.set('league', options.league)
      if (options.season) params.set('season', options.season)

      const response = await fetch(`/api/leaderboards/conferences?${params}`)
      if (!response.ok) throw new Error('Failed to fetch conference leaderboard')

      const data = await response.json()
      return data.conferences as ConferenceStats[]
    },
  })
}
