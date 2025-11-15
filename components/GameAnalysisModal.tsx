'use client'

import { useEffect, useState } from 'react'
import { GameHeader } from '@/components/GameHeader'
import { ScoringWormChart } from '@/components/ScoringWormChart'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Target, Clock, Zap, TrendingUp, Loader2 } from 'lucide-react'
import { Game, PBPEvent } from '@/types'

interface GameAnalysisModalProps {
  gameId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameAnalysisModal({ gameId, open, onOpenChange }: GameAnalysisModalProps) {
  const [game, setGame] = useState<Game | null>(null)
  const [pbpEvents, setPbpEvents] = useState<PBPEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gameId || !open) {
      setGame(null)
      setPbpEvents([])
      setError(null)
      return
    }

    const fetchGameData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch game details
        const gameRes = await fetch(`/api/games/${gameId}`)
        if (!gameRes.ok) throw new Error('Failed to fetch game')
        const gameData = await gameRes.json()
        setGame(gameData)

        // Fetch play-by-play events
        const pbpRes = await fetch(`/api/games/${gameId}/pbp`)
        if (pbpRes.ok) {
          const pbpData = await pbpRes.json()
          setPbpEvents(pbpData.events || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [gameId, open])

  // Convert PBP events to scoring events for the chart
  const scoringEvents = pbpEvents
    .filter(event => event.homeScore !== null && event.awayScore !== null)
    .map(event => {
      // Convert clockSeconds to MM:SS format
      const minutes = Math.floor(event.clockSeconds / 60)
      const seconds = event.clockSeconds % 60
      const clockString = `${minutes}:${seconds.toString().padStart(2, '0')}`

      return {
        timestamp: event.elapsedSeconds,
        period: event.period,
        clock: clockString,
        homeScore: event.homeScore!,
        awayScore: event.awayScore!,
        scoringTeam: event.teamId === game?.homeTeamId ? 'home' as const : 'away' as const,
        description: event.description,
      }
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-basketball-orange to-orange-600 bg-clip-text text-transparent">
            Game Analysis
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-basketball-orange mb-4" />
            <p className="text-muted-foreground">Loading game details...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && game && (
          <div className="space-y-6">
            {/* Game Header */}
            <GameHeader game={game} />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Points"
                value={(game.homeScore || 0) + (game.awayScore || 0)}
                description="Combined score"
                icon={Target}
              />
              <StatsCard
                title="Pace"
                value={pbpEvents.length}
                description="Total possessions"
                icon={Zap}
              />
              <StatsCard
                title="Lead Changes"
                value={calculateLeadChanges(scoringEvents)}
                description="Throughout game"
                icon={TrendingUp}
              />
              <StatsCard
                title="Periods"
                value={game.totalPeriods}
                description={game.overtimeFlag ? 'With OT' : 'Regulation'}
                icon={Clock}
              />
            </div>

            {/* Scoring Chart */}
            {scoringEvents.length > 0 ? (
              <ScoringWormChart
                events={scoringEvents}
                homeTeamName={game.homeTeamName}
                awayTeamName={game.awayTeamName}
                highlightR69={!!game.r69Event}
                r69Event={game.r69Event ? {
                  teamId: game.r69Event.teamId,
                  timestamp: game.r69Event.tTo69 || 0,
                  isHomeTeam: game.r69Event.teamId === game.homeTeamId,
                } : undefined}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No play-by-play data available for this game
                  </p>
                </CardContent>
              </Card>
            )}

            {/* R69 Event Details */}
            {game.r69Event && (
              <Card className="border-2 border-orange-500/50 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <Target className="h-5 w-5" />
                    R69 Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Team</p>
                      <p className="font-semibold">{game.r69Event.teamName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time to 69</p>
                      <p className="font-semibold">{((game.r69Event.tTo69 || 0) / 60).toFixed(1)} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margin at 69</p>
                      <p className="font-semibold">{game.r69Event.marginAt69 > 0 ? '+' : ''}{game.r69Event.marginAt69}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Result</p>
                      <p className={`font-semibold ${game.r69Event.r69w ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {game.r69Event.r69w ? 'R69W' : 'R69L'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Play-by-Play Timeline */}
            {pbpEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Play-by-Play Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {pbpEvents.slice(0, 50).map((event, idx) => {
                      const minutes = Math.floor(event.clockSeconds / 60)
                      const seconds = event.clockSeconds % 60
                      const clockString = `${minutes}:${seconds.toString().padStart(2, '0')}`

                      return (
                        <div
                          key={event.id || idx}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                        >
                          <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px]">
                            <div className="font-semibold">P{event.period}</div>
                            <div>{clockString}</div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{event.description}</p>
                          </div>
                          <div className="text-sm font-semibold whitespace-nowrap">
                            {event.homeScore !== null && event.awayScore !== null && (
                              <span className="text-muted-foreground">
                                {event.awayScore} - {event.homeScore}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pbpEvents.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing first 50 of {pbpEvents.length} plays
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Helper function to calculate lead changes
function calculateLeadChanges(events: any[]) {
  let leadChanges = 0
  let previousLeader: 'home' | 'away' | 'tied' = 'tied'

  events.forEach(event => {
    const currentLeader =
      event.homeScore > event.awayScore ? 'home' :
      event.awayScore > event.homeScore ? 'away' :
      'tied'

    if (currentLeader !== previousLeader && currentLeader !== 'tied' && previousLeader !== 'tied') {
      leadChanges++
    }
    previousLeader = currentLeader
  })

  return leadChanges
}
