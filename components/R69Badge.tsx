import { Badge } from '@/components/ui/badge'
import { R69Event, GameStatus } from '@/types'
import { formatTime } from '@/lib/formatters'

interface R69BadgeProps {
  r69Event?: R69Event | null
  gameStatus: GameStatus
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
}

export function R69Badge({
  r69Event,
  gameStatus,
  homeTeamId,
  awayTeamId,
  homeScore,
  awayScore,
}: R69BadgeProps) {
  // No R69 event yet
  if (!r69Event) {
    // Check if anyone can still hit 69
    const canStillHit69 = homeScore < 69 || awayScore < 69

    if (gameStatus === GameStatus.FINAL && !canStillHit69) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          No R69
        </Badge>
      )
    }

    if (gameStatus === GameStatus.IN_PROGRESS) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Racing to 69...
        </Badge>
      )
    }

    return null
  }

  // Determine if R69 team won
  const r69TeamIsHome = r69Event.teamId === homeTeamId
  const variant = r69Event.r69w ? 'r69w' : 'premature'
  const label = r69Event.r69w ? 'R69W' : 'Premature69'

  const teamAbbr = r69TeamIsHome ? 'H' : 'A'
  const margin = r69Event.marginAt69
  const timeToR69 = formatTime(r69Event.tTo69)

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
      <div className="text-xs text-muted-foreground">
        {teamAbbr} • +{margin} • {timeToR69}
      </div>
    </div>
  )
}
