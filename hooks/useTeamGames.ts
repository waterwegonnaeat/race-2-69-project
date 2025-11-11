import { useQuery } from '@tanstack/react-query'

interface UseTeamGamesParams {
  teamName: string | null
  seasons: string[]
  enabled?: boolean
}

export function useTeamGames({ teamName, seasons, enabled = true }: UseTeamGamesParams) {
  return useQuery({
    queryKey: ['team-games', teamName, seasons],
    queryFn: async () => {
      if (!teamName) {
        return { games: [], totalGames: 0, teamName: '', seasons: [] }
      }

      const seasonsParam = seasons.length > 0 ? `?seasons=${seasons.join(',')}` : ''
      const response = await fetch(`/api/teams/${encodeURIComponent(teamName)}/games${seasonsParam}`)

      if (!response.ok) {
        throw new Error('Failed to fetch team games')
      }

      return response.json()
    },
    enabled: enabled && !!teamName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
