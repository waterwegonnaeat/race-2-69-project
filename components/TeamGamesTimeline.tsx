'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trophy, Target, TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardHeader } from './DashboardHeader'
import { TeamWithLogo } from './TeamLogo'

interface Game {
  id: string
  gameId: string
  gameDate: Date | string
  season: string
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string | null
  awayTeamLogo?: string | null
  homeScore: number | null
  awayScore: number | null
  finalMargin: number | null
  gameStatus: string
  r69Event?: {
    teamId: string
    teamName: string
    r69w: boolean
    marginAt69: number
    tTo69: number
  } | null
}

interface TeamGamesTimelineProps {
  games: Game[]
  teamName: string
  initialFilters?: {
    gameType: string
    venue: string
    result: string
    r69Status: string
  }
}

export function TeamGamesTimeline({ games, teamName, initialFilters }: TeamGamesTimelineProps) {
  const [filters, setFilters] = useState({
    gameType: (initialFilters?.gameType || 'all') as 'all' | 'regular' | 'tournament',
    venue: (initialFilters?.venue || 'all') as 'all' | 'home' | 'away',
    result: (initialFilters?.result || 'all') as 'all' | 'wins' | 'losses',
    r69Status: (initialFilters?.r69Status || 'all') as 'all' | 'r69_only' | 'no_r69'
  })
  const [isGameListExpanded, setIsGameListExpanded] = useState(true)

  // Sync filters when initialFilters change from parent
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        gameType: (initialFilters.gameType || 'all') as 'all' | 'regular' | 'tournament',
        venue: (initialFilters.venue || 'all') as 'all' | 'home' | 'away',
        result: (initialFilters.result || 'all') as 'all' | 'wins' | 'losses',
        r69Status: (initialFilters.r69Status || 'all') as 'all' | 'r69_only' | 'no_r69'
      })
    }
  }, [initialFilters])

  const chartData = useMemo(() => {
    return games
      .sort((a, b) => {
        const dateA = new Date(a.gameDate).getTime()
        const dateB = new Date(b.gameDate).getTime()
        return dateA - dateB
      })
      .map((game, index) => {
        const isHome = game.homeTeamName === teamName
        const teamScore = isHome ? game.homeScore : game.awayScore
        const oppScore = isHome ? game.awayScore : game.homeScore
        const won = teamScore && oppScore ? teamScore > oppScore : null
        const margin = teamScore && oppScore ? teamScore - oppScore : null

        const hadR69Event = game.r69Event?.teamName === teamName
        const wonAfterR69 = hadR69Event ? game.r69Event?.r69w : null

        return {
          gameNumber: index + 1,
          date: format(new Date(game.gameDate), 'MM/dd'),
          fullDate: format(new Date(game.gameDate), 'MMM dd, yyyy'),
          opponent: isHome ? game.awayTeamName : game.homeTeamName,
          opponentLogo: isHome ? game.awayTeamLogo : game.homeTeamLogo,
          teamScore,
          oppScore,
          margin,
          won,
          hadR69Event,
          wonAfterR69,
          marginAt69: hadR69Event ? game.r69Event?.marginAt69 : null,
          tTo69: hadR69Event ? (game.r69Event?.tTo69 || 0) / 60 : null, // Convert to minutes
          gameId: game.id,
          isHome,
        }
      })
  }, [games, teamName])

  // Apply filters
  const filteredData = useMemo(() => {
    return chartData.filter(game => {
      // Game type filter
      if (filters.gameType !== 'all') {
        const gameTypeFromSeason = game.gameId // You'd need to add gameType to the game data
        // For now, we'll skip this filter if gameType data isn't available
      }

      // Venue filter
      if (filters.venue === 'home' && !game.isHome) return false
      if (filters.venue === 'away' && game.isHome) return false

      // Result filter
      if (filters.result === 'wins' && !game.won) return false
      if (filters.result === 'losses' && game.won !== false) return false

      // R69 status filter
      if (filters.r69Status === 'r69_only' && !game.hadR69Event) return false
      if (filters.r69Status === 'no_r69' && game.hadR69Event) return false

      return true
    })
  }, [chartData, filters])

  const stats = useMemo(() => {
    const dataToUse = filteredData
    const completedGames = dataToUse.filter(g => g.won !== null)
    const wins = completedGames.filter(g => g.won).length
    const losses = completedGames.filter(g => g.won === false).length
    const r69Games = dataToUse.filter(g => g.hadR69Event)
    // R69W means the team won the game after hitting 69 first
    const r69Wins = r69Games.filter(g => g.wonAfterR69 === true).length
    const r69Losses = r69Games.filter(g => g.wonAfterR69 === false).length

    // R69-specific advanced stats
    const avgMarginAt69 = r69Games.length > 0
      ? (r69Games.reduce((sum, g) => sum + (g.marginAt69 || 0), 0) / r69Games.length).toFixed(1)
      : '0'

    const avgTimeToR69 = r69Games.length > 0
      ? (r69Games.reduce((sum, g) => sum + (g.tTo69 || 0), 0) / r69Games.length).toFixed(1)
      : '0'

    const r69EventRate = dataToUse.length > 0
      ? (r69Games.length / dataToUse.length * 100).toFixed(1)
      : '0'

    const homeR69Games = r69Games.filter(g => g.isHome)
    const awayR69Games = r69Games.filter(g => !g.isHome)

    return {
      totalGames: dataToUse.length,
      wins,
      losses,
      r69Games: r69Games.length,
      r69Wins,
      r69Losses,
      r69WinRate: r69Games.length > 0 ? (r69Wins / r69Games.length * 100).toFixed(1) : '0',
      r69EventRate,
      avgMarginAt69,
      avgTimeToR69,
      homeR69Count: homeR69Games.length,
      awayR69Count: awayR69Games.length,
      avgMargin: completedGames.length > 0
        ? (completedGames.reduce((sum, g) => sum + (g.margin || 0), 0) / completedGames.length).toFixed(1)
        : '0',
    }
  }, [filteredData])

  // Calculate total seasons
  const seasons = Array.from(new Set(games.map(g => g.season)))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-16">
        <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground text-lg">No games found for {teamName}</p>
        <p className="text-sm text-muted-foreground mt-2">Try selecting different seasons</p>
      </div>
    )
  }

  // Extract team logo from first game
  const teamLogo = useMemo(() => {
    const firstGame = games[0]
    if (!firstGame) return null
    return firstGame.homeTeamName === teamName
      ? firstGame.homeTeamLogo
      : firstGame.awayTeamLogo
  }, [games, teamName])

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        teamName={teamName}
        teamLogo={teamLogo}
        totalSeasons={seasons.length}
        stats={{
          totalGames: chartData.length,
          wins: chartData.filter(g => g.won).length,
          losses: chartData.filter(g => g.won === false).length,
          r69Events: chartData.filter(g => g.hadR69Event).length
        }}
      />

      {/* Stats Overview - Modern Cards with Better Visibility */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Games</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGames}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-green-200 dark:border-green-900/50 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Wins</p>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.wins}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-red-200 dark:border-red-900/50 hover:border-red-400 transition-all hover:shadow-lg hover:shadow-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Losses</p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.losses}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-amber-200 dark:border-amber-900/50 hover:border-amber-400 transition-all hover:shadow-lg hover:shadow-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">R69 Events</p>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.r69Games}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">R69 Wins</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.r69Wins}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-rose-200 dark:border-rose-900/50 hover:border-rose-400 transition-all hover:shadow-lg hover:shadow-rose-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">R69 Losses</p>
          </div>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.r69Losses}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">R69W Rate</p>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.r69WinRate}%</p>
        </Card>
      </div>

      {/* Additional R69 Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-purple-200 dark:border-purple-900/50 hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">R69 Event Rate</p>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.r69EventRate}%</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-blue-200 dark:border-blue-900/50 hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Avg Margin @ 69</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.avgMarginAt69}</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Avg Time to 69</p>
          </div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{stats.avgTimeToR69} min</p>
        </Card>

        <Card className="p-4 bg-white/95 dark:bg-zinc-900/95 border-2 border-teal-200 dark:border-teal-900/50 hover:border-teal-400 transition-all hover:shadow-lg hover:shadow-teal-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Home/Away R69</p>
          </div>
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.homeR69Count}/{stats.awayR69Count}</p>
        </Card>
      </div>

      {/* R69 Event Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            R69 Event Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'R69 Wins', value: stats.r69Wins, color: '#10b981' },
                  { name: 'R69 Losses', value: stats.r69Losses, color: '#ef4444' },
                  { name: 'No R69 Event', value: stats.totalGames - stats.r69Games, color: '#94a3b8' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#94a3b8" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            R69 Performance Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'R69 Wins', value: stats.r69Wins, color: '#10b981' },
              { name: 'R69 Losses', value: stats.r69Losses, color: '#ef4444' },
              { name: 'No R69', value: stats.totalGames - stats.r69Games, color: '#94a3b8' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} className="dark:fill-gray-400" />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} className="dark:fill-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #f97316',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[
                  { color: '#10b981' },
                  { color: '#ef4444' },
                  { color: '#94a3b8' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Point Differential Chart */}
      <Card className="p-6 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Point Differential Over Time
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={filteredData}>
            <defs>
              <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
              label={{ value: 'Point Margin', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null
                const data = payload[0].payload
                return (
                  <Card className="p-4 border-2 border-orange-400 shadow-xl bg-white dark:bg-zinc-900">
                    <p className="font-bold mb-1 text-gray-900 dark:text-white">{data.fullDate}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>vs</span>
                      <TeamWithLogo
                        teamName={data.opponent}
                        logoUrl={data.opponentLogo}
                        size="sm"
                        clickable={false}
                      />
                      <span>{data.isHome ? '(H)' : '(A)'}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Score: <span className="font-semibold text-gray-900 dark:text-white">{data.teamScore} - {data.oppScore}</span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Margin: <span className={`font-semibold ${data.margin > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {data.margin > 0 ? '+' : ''}{data.margin}
                        </span>
                      </p>
                      {data.hadR69Event && (
                        <Badge className="mt-2 bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500">
                          R69 Event - {data.wonAfterR69 ? 'Won' : 'Lost'}
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              }}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="margin"
              fill="url(#marginGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="#f97316"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (payload.hadR69Event) {
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill={payload.wonAfterR69 ? '#10B981' : '#EF4444'}
                      stroke="#fff"
                      strokeWidth={3}
                    />
                  )
                }
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={payload.won ? '#10b981' : '#ef4444'}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-white" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-600 border-3 border-white ring-2 ring-green-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">R69 Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600 border-3 border-white ring-2 ring-red-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">R69 Loss</span>
          </div>
        </div>
      </Card>

      {/* R69 Win Rate by Margin Analysis */}
      {stats.r69Games > 0 && (() => {
        const r69Data = filteredData.filter(g => g.hadR69Event)

        // Group games by margin ranges
        const marginRanges = [
          { range: '-10+', min: -Infinity, max: -10 },
          { range: '-9 to -5', min: -9, max: -5 },
          { range: '-4 to -1', min: -4, max: -1 },
          { range: '0 (Tied)', min: 0, max: 0 },
          { range: '+1 to +4', min: 1, max: 4 },
          { range: '+5 to +9', min: 5, max: 9 },
          { range: '+10+', min: 10, max: Infinity }
        ]

        const marginAnalysis = marginRanges.map(({ range, min, max }) => {
          const gamesInRange = r69Data.filter(g => {
            const margin = g.marginAt69 || 0
            return margin >= min && margin <= max
          })

          const wins = gamesInRange.filter(g => g.wonAfterR69).length
          const total = gamesInRange.length
          const winRate = total > 0 ? (wins / total) * 100 : 0

          return {
            range,
            winRate: parseFloat(winRate.toFixed(1)),
            wins,
            total,
            games: gamesInRange.length
          }
        }).filter(item => item.games > 0)

        return (
          <Card className="p-6 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              R69W Win Rate by Margin at 69
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              How likely is {teamName} to win based on their lead/deficit when hitting 69 points?
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={marginAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  stroke="#9ca3af"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload
                    return (
                      <Card className="p-4 border-2 border-orange-400 shadow-xl bg-white dark:bg-zinc-900">
                        <p className="font-bold mb-2 text-gray-900 dark:text-white">Margin: {data.range}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">
                            Win Rate: <span className="font-semibold text-green-600 dark:text-green-400">{data.winRate}%</span>
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            Record: <span className="font-semibold text-gray-900 dark:text-white">{data.wins}-{data.total - data.wins}</span>
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            Games: <span className="font-semibold text-gray-900 dark:text-white">{data.games}</span>
                          </p>
                        </div>
                      </Card>
                    )
                  }}
                />
                <Bar
                  dataKey="winRate"
                  radius={[8, 8, 0, 0]}
                >
                  {marginAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.winRate >= 70 ? '#10b981' : entry.winRate >= 50 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label={{ value: '50%', fill: '#666' }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">≥70% Win Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">50-69% Win Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">&lt;50% Win Rate</span>
              </div>
            </div>
          </Card>
        )
      })()}

      {/* Game-by-Game List */}
      <Card className="p-6 bg-white/95 dark:bg-zinc-900/95 border-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Game-by-Game Results
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({filteredData.length} {filteredData.length === 1 ? 'game' : 'games'})
            </span>
          </h3>
          <button
            onClick={() => setIsGameListExpanded(!isGameListExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium"
          >
            {isGameListExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </button>
        </div>
        {isGameListExpanded && (
          <TooltipProvider delayDuration={200}>
            <div className="space-y-2">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No games match the current filters</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your filter settings</p>
              </div>
            ) : (
              filteredData.map((game, index) => (
              <UITooltip key={game.gameId}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/game/${game.gameId}`}
                    className="block group"
                  >
                    <div className={`p-3 rounded-lg border transition-all hover:border-orange-500 hover:shadow-md ${
                      game.won === true
                        ? 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
                        : game.won === false
                        ? 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono w-12">
                            {game.date}
                          </div>
                          {game.won === true && <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />}
                          {game.won === false && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                          <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">vs</span>
                          <TeamWithLogo
                            teamName={game.opponent}
                            logoUrl={game.opponentLogo}
                            size="sm"
                            clickable={true}
                            className="hover:text-basketball-orange"
                          />
                          {!game.isHome && <Badge variant="outline" className="text-xs h-5 bg-white/50 dark:bg-gray-800/50">A</Badge>}
                          {game.hadR69Event && (
                            <Badge className="bg-orange-500/20 text-orange-800 dark:text-orange-400 border border-orange-500/50 text-xs h-5 px-2">
                              R69
                            </Badge>
                          )}
                        </div>

                        {game.teamScore !== null && game.oppScore !== null && (
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${game.won ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                              {game.teamScore}
                            </span>
                            <span className="text-gray-400 dark:text-gray-600 font-medium">-</span>
                            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                              {game.oppScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-4 bg-white dark:bg-zinc-900 border-2 border-orange-400">
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{game.fullDate}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>vs</span>
                        <TeamWithLogo
                          teamName={game.opponent}
                          logoUrl={game.opponentLogo}
                          size="sm"
                          clickable={false}
                        />
                        <span>{game.isHome ? '(Home)' : '(Away)'}</span>
                      </div>
                    </div>

                    {game.teamScore !== null && game.oppScore !== null && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Final Score:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {game.teamScore} - {game.oppScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Margin:</span>
                          <span className={`font-semibold ${game.margin && game.margin > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {game.margin && game.margin > 0 ? '+' : ''}{game.margin}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Result:</span>
                          <Badge className={game.won ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>
                            {game.won ? 'Win' : 'Loss'}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {game.hadR69Event && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500">
                            R69 Event
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Margin at 69:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{game.marginAt69}</span>
                          </div>
                          {game.tTo69 !== null && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Time to 69:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{game.tTo69.toFixed(1)} min</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">R69 Result:</span>
                            <Badge className={game.wonAfterR69 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>
                              {game.wonAfterR69 ? 'R69W' : 'R69L'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                      Click to view full game details
                    </p>
                  </div>
                </TooltipContent>
              </UITooltip>
              ))
            )}
          </div>
        </TooltipProvider>
        )}
      </Card>
    </div>
  )
}
