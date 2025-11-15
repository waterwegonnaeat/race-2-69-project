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
        const errorText = await response.text()
        console.error('Failed to fetch team games:', errorText)
        throw new Error(`Failed to fetch team games: ${response.status}`)
      }

      return response.json()
    },
    enabled: enabled && !!teamName && seasons.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
