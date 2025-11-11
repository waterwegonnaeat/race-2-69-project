'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, TrendingUp, TrendingDown, Filter, Search, Calendar,
  BarChart3, Activity, Target, Zap, ChevronDown, ChevronRight,
  Sparkles, Flame, Clock, Users, Award, Medal, Star, Eye,
  Grid3x3, List, SlidersHorizontal, RefreshCw, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernGameCard } from './ModernGameCard'
import { LiveStatsWidget } from './LiveStatsWidget'
import { AdvancedFilters } from './AdvancedFilters'
import { QuickStats } from './QuickStats'
import { InteractiveChart } from './InteractiveChart'

interface ModernDashboardProps {
  initialView?: 'grid' | 'list'
}

export function ModernDashboard({ initialView = 'grid' }: ModernDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({
    leagues: [],
    conferences: [],
    dateRange: null,
    gameStatus: 'all',
    r69Status: 'all',
    winProbability: null,
  })
  const [games, setGames] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'r69-progress' | 'excitement'>('date')

  // Fetch games and stats
  useEffect(() => {
    fetchGamesAndStats()
  }, [selectedFilters, sortBy])

  const fetchGamesAndStats = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/games/today')
      const data = await response.json()
      setGames(data.games || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGames = games.filter(game => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        game.homeTeam?.toLowerCase().includes(query) ||
        game.awayTeam?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const activeFilterCount = Object.values(selectedFilters).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== null && v !== 'all'
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Race to 69
                </h1>
                <p className="text-xs text-slate-400">Live Dashboard</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search teams, games, players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative border-white/10 text-white hover:bg-white/5"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-orange-500 hover:bg-orange-600' : 'text-white hover:bg-white/5'}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : 'text-white hover:bg-white/5'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchGamesAndStats}
                className="border-white/10 text-white hover:bg-white/5"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden"
          >
            <AdvancedFilters
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Row */}
        <QuickStats stats={stats} isLoading={isLoading} />

        {/* Live Games Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold text-white">
                  Live Games
                </h2>
              </div>
              <Badge variant="outline" className="border-red-500/50 text-red-400">
                {filteredGames.filter(g => g.status === 'live').length} Live
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-400">
                {filteredGames.length} Total
              </Badge>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
              >
                <option value="date">Latest First</option>
                <option value="r69-progress">R69 Progress</option>
                <option value="excitement">Excitement Level</option>
              </select>
            </div>
          </div>

          {/* Games Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-white/5 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-20 text-center">
                <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
                <p className="text-slate-400">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for live games'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              <AnimatePresence mode="popLayout">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ModernGameCard game={game} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Stats & Analytics Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveChart
            title="R69 Win Rate Trends"
            type="line"
            data={stats?.trends || []}
          />
          <InteractiveChart
            title="Conference Performance"
            type="bar"
            data={stats?.conferences || []}
          />
        </div>
      </div>
    </div>
  )
}
