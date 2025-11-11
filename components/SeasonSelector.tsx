'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface SeasonSelectorProps {
  selectedSeasons: string[]
  onSeasonsChange: (seasons: string[]) => void
  autoSelectAll?: boolean
}

export function SeasonSelector({ selectedSeasons, onSeasonsChange, autoSelectAll = false }: SeasonSelectorProps) {
  const [open, setOpen] = useState(false)
  const [seasons, setSeasons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch available seasons from the database
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons')
        const data = await response.json()
        setSeasons(data.seasons || [])

        // Auto-select all seasons if requested and no seasons are currently selected
        if (autoSelectAll && selectedSeasons.length === 0 && data.seasons.length > 0) {
          onSeasonsChange(data.seasons)
        }
      } catch (error) {
        console.error('Error fetching seasons:', error)
        // Fallback to generated seasons
        setSeasons(generateSeasons())
      } finally {
        setLoading(false)
      }
    }

    fetchSeasons()
  }, []) // Only run once on mount

  // Generate seasons as fallback
  function generateSeasons(): string[] {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const latestSeasonStart = currentMonth < 4 ? currentYear - 1 : currentYear

    const seasons: string[] = []
    for (let year = latestSeasonStart; year >= 2006; year--) {
      seasons.push(`${year}-${(year + 1).toString().slice(2)}`)
    }
    return seasons
  }

  const toggleSeason = (season: string) => {
    const updated = selectedSeasons.includes(season)
      ? selectedSeasons.filter(s => s !== season)
      : [...selectedSeasons, season]

    onSeasonsChange(updated.sort().reverse()) // Keep sorted newest first
  }

  const selectAll = () => {
    onSeasonsChange(seasons)
  }

  const clearAll = () => {
    onSeasonsChange([])
  }

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[280px] justify-between bg-background/60 backdrop-blur-sm border-2 hover:border-basketball-orange/50 transition-all"
          >
            <span className="text-sm font-medium">
              {selectedSeasons.length === 0 && 'Select seasons...'}
              {selectedSeasons.length === 1 && `${selectedSeasons[0]} Season`}
              {selectedSeasons.length > 1 && `${selectedSeasons.length} seasons selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search seasons..." />
            <CommandEmpty>No season found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              <div className="flex gap-2 p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={clearAll}
                >
                  Clear All
                </Button>
              </div>
              {seasons.map((season) => {
                const isSelected = selectedSeasons.includes(season)
                return (
                  <CommandItem
                    key={season}
                    value={season}
                    onSelect={() => toggleSeason(season)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100 text-basketball-orange' : 'opacity-0'
                      )}
                    />
                    <span className={cn(isSelected && 'font-semibold')}>
                      {season} Season
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected seasons badges */}
      {selectedSeasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSeasons.slice(0, 3).map((season) => (
            <Badge
              key={season}
              variant="secondary"
              className="bg-basketball-orange/10 text-basketball-orange border-basketball-orange/20 hover:bg-basketball-orange/20"
            >
              {season}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSeason(season)
                }}
                className="ml-1 hover:text-basketball-orange/70"
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedSeasons.length > 3 && (
            <Badge variant="outline" className="text-muted-foreground">
              +{selectedSeasons.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
