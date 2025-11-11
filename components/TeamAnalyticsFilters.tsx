'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Filter,
  X,
  Calendar,
  Home,
  Plane,
  Trophy,
  Target,
  ChevronDown
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOptions {
  gameType: 'all' | 'regular' | 'tournament'
  venue: 'all' | 'home' | 'away'
  result: 'all' | 'wins' | 'losses'
  r69Status: 'all' | 'r69_only' | 'no_r69'
}

interface TeamAnalyticsFiltersProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  stats: {
    total: number
    filtered: number
  }
}

export function TeamAnalyticsFilters({
  filters,
  onFilterChange,
  stats
}: TeamAnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFilterChange({
      gameType: 'all',
      venue: 'all',
      result: 'all',
      r69Status: 'all'
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filter Games</h3>
          {activeFilterCount > 0 && (
            <Badge className="bg-orange-500 text-white">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 dark:text-gray-400"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span>Showing <span className="font-bold text-orange-600 dark:text-orange-400">{stats.filtered}</span> of <span className="font-semibold">{stats.total}</span> games</span>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Game Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Game Type
            </label>
            <Select
              value={filters.gameType}
              onValueChange={(value) => updateFilter('gameType', value)}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="regular">Regular Season</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Home className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Venue
            </label>
            <Select
              value={filters.venue}
              onValueChange={(value) => updateFilter('venue', value)}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                <SelectItem value="home">Home Only</SelectItem>
                <SelectItem value="away">Away Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Result Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Result
            </label>
            <Select
              value={filters.result}
              onValueChange={(value) => updateFilter('result', value)}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="wins">Wins Only</SelectItem>
                <SelectItem value="losses">Losses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* R69 Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-4 h-4 text-xs font-bold text-orange-600 dark:text-orange-400 border-2 border-orange-600 dark:border-orange-400 rounded">
                69
              </span>
              R69 Status
            </label>
            <Select
              value={filters.r69Status}
              onValueChange={(value) => updateFilter('r69Status', value)}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="r69_only">R69 Events Only</SelectItem>
                <SelectItem value="no_r69">No R69 Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  )
}
