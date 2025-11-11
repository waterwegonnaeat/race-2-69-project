'use client'

import { Button } from '@/components/ui/button'
import { League, GameStatus } from '@/types'
import { formatGameDate } from '@/lib/formatters'

interface BoardFiltersProps {
  selectedDate: Date
  selectedLeague?: League
  selectedStatus?: GameStatus | 'all'
  onDateChange: (date: Date) => void
  onLeagueChange: (league?: League) => void
  onStatusChange: (status?: GameStatus | 'all') => void
}

export function BoardFilters({
  selectedDate,
  selectedLeague,
  selectedStatus = 'all',
  onDateChange,
  onLeagueChange,
  onStatusChange,
}: BoardFiltersProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const prev = new Date(selectedDate)
            prev.setDate(prev.getDate() - 1)
            onDateChange(prev)
          }}
        >
          ← Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant={selectedDate.getTime() === yesterday.getTime() ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDateChange(yesterday)}
          >
            Yesterday
          </Button>

          <Button
            variant={selectedDate.getTime() === today.getTime() ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDateChange(today)}
          >
            Today
          </Button>

          <Button
            variant={selectedDate.getTime() === tomorrow.getTime() ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDateChange(tomorrow)}
          >
            Tomorrow
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const next = new Date(selectedDate)
            next.setDate(next.getDate() + 1)
            onDateChange(next)
          }}
        >
          Next →
        </Button>
      </div>

      {/* Current Date Display */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {formatGameDate(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* League Filter */}
        <div className="flex gap-2">
          <Button
            variant={!selectedLeague ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLeagueChange(undefined)}
          >
            All
          </Button>
          <Button
            variant={selectedLeague === League.MENS ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLeagueChange(League.MENS)}
          >
            Men's
          </Button>
          <Button
            variant={selectedLeague === League.WOMENS ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLeagueChange(League.WOMENS)}
          >
            Women's
          </Button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('all')}
          >
            All Games
          </Button>
          <Button
            variant={selectedStatus === GameStatus.IN_PROGRESS ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(GameStatus.IN_PROGRESS)}
          >
            Live
          </Button>
          <Button
            variant={selectedStatus === GameStatus.FINAL ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(GameStatus.FINAL)}
          >
            Final
          </Button>
          <Button
            variant={selectedStatus === GameStatus.SCHEDULED ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(GameStatus.SCHEDULED)}
          >
            Upcoming
          </Button>
        </div>
      </div>
    </div>
  )
}
