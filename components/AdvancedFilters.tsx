'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Filter, Calendar, Users, Trophy, Target, TrendingUp,
  Clock, BarChart3, CheckCircle2, Circle, Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface AdvancedFiltersProps {
  selectedFilters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  onClose: () => void
}

export function AdvancedFilters({
  selectedFilters,
  onFiltersChange,
  onClose
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(selectedFilters)

  const conferences = [
    'ACC', 'Big 12', 'Big Ten', 'SEC', 'Pac-12', 'Big East',
    'American', 'Mountain West', 'WCC', 'Atlantic 10'
  ]

  const gameStatuses = [
    { value: 'all', label: 'All Games', icon: Filter },
    { value: 'live', label: 'Live Now', icon: Flame },
    { value: 'final', label: 'Final', icon: CheckCircle2 },
    { value: 'upcoming', label: 'Upcoming', icon: Clock },
  ]

  const r69Statuses = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'reached', label: 'R69 Reached', icon: Trophy },
    { value: 'near', label: 'Near 69 (90%+)', icon: Target },
    { value: 'not-reached', label: 'Not Reached', icon: Circle },
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'season', label: 'This Season' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleConference = (conference: string) => {
    const current = localFilters.conferences || []
    const updated = current.includes(conference)
      ? current.filter((c: string) => c !== conference)
      : [...current, conference]
    updateFilter('conferences', updated)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const resetFilters = () => {
    const reset = {
      leagues: [],
      conferences: [],
      dateRange: null,
      gameStatus: 'all',
      r69Status: 'all',
      winProbability: null,
      minScore: 0,
      maxScore: 150,
      excitementLevel: 0,
    }
    setLocalFilters(reset)
    onFiltersChange(reset)
  }

  const activeCount = Object.values(localFilters).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== null && v !== 'all' && v !== 0
  ).length

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
          {activeCount > 0 && (
            <Badge className="bg-orange-500 text-white">
              {activeCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-slate-400 hover:text-white"
          >
            Reset All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Game Status */}
        <div className="space-y-3">
          <Label className="text-white font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Game Status
          </Label>
          <div className="space-y-2">
            {gameStatuses.map(status => {
              const Icon = status.icon
              return (
                <button
                  key={status.value}
                  onClick={() => updateFilter('gameStatus', status.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                    localFilters.gameStatus === status.value
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{status.label}</span>
                  {localFilters.gameStatus === status.value && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-orange-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* R69 Status */}
        <div className="space-y-3">
          <Label className="text-white font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            R69 Status
          </Label>
          <div className="space-y-2">
            {r69Statuses.map(status => {
              const Icon = status.icon
              return (
                <button
                  key={status.value}
                  onClick={() => updateFilter('r69Status', status.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                    localFilters.r69Status === status.value
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{status.label}</span>
                  {localFilters.r69Status === status.value && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-orange-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Conferences */}
        <div className="space-y-3">
          <Label className="text-white font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            Conferences
            {localFilters.conferences?.length > 0 && (
              <Badge variant="outline" className="ml-auto border-orange-500 text-orange-400">
                {localFilters.conferences.length}
              </Badge>
            )}
          </Label>
          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {conferences.map(conference => (
              <label
                key={conference}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
              >
                <Checkbox
                  checked={localFilters.conferences?.includes(conference)}
                  onCheckedChange={() => toggleConference(conference)}
                  className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span className="text-sm text-white flex-1">{conference}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range & Advanced Options */}
        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              Date Range
            </Label>
            <div className="space-y-2">
              {dateRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => updateFilter('dateRange', range.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all ${
                    localFilters.dateRange === range.value
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="flex-1 text-left">{range.label}</span>
                  {localFilters.dateRange === range.value && (
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Excitement Level */}
          <div className="space-y-3">
            <Label className="text-white font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Min Excitement Level
              <Badge variant="outline" className="ml-auto border-orange-500 text-orange-400">
                {localFilters.excitementLevel || 0}%
              </Badge>
            </Label>
            <Slider
              value={[localFilters.excitementLevel || 0]}
              onValueChange={([value]) => updateFilter('excitementLevel', value)}
              max={100}
              step={10}
              className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-400"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Any</span>
              <span>50%</span>
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {activeCount > 0 ? (
            <span>{activeCount} filter{activeCount !== 1 ? 's' : ''} applied</span>
          ) : (
            <span>No filters applied</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={applyFilters}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
