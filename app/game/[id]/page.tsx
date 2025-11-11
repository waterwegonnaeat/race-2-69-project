'use client'

import { useRouter } from 'next/navigation'
import { GameHeader } from '@/components/GameHeader'
import { ScoringWormChart } from '@/components/ScoringWormChart'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Target, Clock, Zap } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Game, PBPEvent } from '@/types'

interface GameDetailPageProps {
  params: { id: string }
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = params
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [pbpEvents, setPbpEvents] = useState<PBPEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true)

        // Fetch game details
        const gameRes = await fetch(`/api/games/${id}`)
        if (!gameRes.ok) throw new Error('Failed to fetch game')
        const gameData = await gameRes.json()
        setGame(gameData)

        // Fetch play-by-play events
        const pbpRes = await fetch(`/api/games/${id}/play-by-play`)
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
  }, [id])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-basketball-orange mb-4" />
            <p className="text-muted-foreground">Loading game details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-16 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-destructive font-medium">
              {error || 'Game not found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Game Header */}
          <GameHeader game={game} />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Play-by-Play Timeline */}
          {pbpEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Play-by-Play</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                  )}
                  )}
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
      </div>
    </div>
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
