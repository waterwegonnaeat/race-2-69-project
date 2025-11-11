import { Badge } from '@/components/ui/badge'
import { GameStatus } from '@/types'
import { formatGameStatus } from '@/lib/formatters'

interface StatusBadgeProps {
  status: GameStatus
  period?: number
  clock?: string
}

export function StatusBadge({ status, period, clock }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case GameStatus.IN_PROGRESS:
        return 'default'
      case GameStatus.FINAL:
        return 'secondary'
      case GameStatus.SCHEDULED:
        return 'outline'
      case GameStatus.POSTPONED:
      case GameStatus.CANCELED:
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getClassName = () => {
    if (status === GameStatus.IN_PROGRESS) {
      return 'animate-pulse-r69 bg-basketball-orange'
    }
    return ''
  }

  return (
    <Badge variant={getVariant()} className={getClassName()}>
      {formatGameStatus(status, period, clock)}
    </Badge>
  )
}
