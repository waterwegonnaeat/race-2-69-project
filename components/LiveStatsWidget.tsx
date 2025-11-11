'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, TrendingUp, TrendingDown, Zap, Target,
  Trophy, Flame, Clock, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LiveStatsWidgetProps {
  gameId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface RecentEvent {
  team: string
  event: string
  time: string
  type: 'r69' | 'win' | 'loss'
}

export function LiveStatsWidget({
  gameId,
  autoRefresh = true,
  refreshInterval = 10000
}: LiveStatsWidgetProps) {
  const [liveStats, setLiveStats] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!autoRefresh) return

    const fetchLiveStats = async () => {
      setIsUpdating(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/stats/live${gameId ? `?gameId=${gameId}` : ''}`)
        const data = await response.json()
        setLiveStats(data)
      } catch (error) {
        console.error('Error fetching live stats:', error)
      } finally {
        setTimeout(() => setIsUpdating(false), 300)
      }
    }

    fetchLiveStats()
    const interval = setInterval(fetchLiveStats, refreshInterval)

    return () => clearInterval(interval)
  }, [gameId, autoRefresh, refreshInterval])

  const metrics = [
    {
      label: 'Active Games',
      value: liveStats?.activeGames || 12,
      trend: 'up',
      trendValue: '+3',
      icon: Activity,
      color: 'text-blue-400',
    },
    {
      label: 'R69 Win Rate',
      value: liveStats?.winRate ? `${liveStats.winRate}%` : '73.2%',
      trend: 'up',
      trendValue: '+1.2%',
      icon: Trophy,
      color: 'text-orange-400',
    },
    {
      label: 'Hot Games',
      value: liveStats?.hotGames || 5,
      trend: 'up',
      trendValue: '+2',
      icon: Flame,
      color: 'text-red-400',
    },
    {
      label: 'Viewers',
      value: liveStats?.totalViewers || '24.5K',
      trend: 'up',
      trendValue: '+1.2K',
      icon: Users,
      color: 'text-purple-400',
    },
  ]

  const recentEvents = liveStats?.recentEvents || [
    { team: 'Duke', event: 'Reached 69 first!', time: '2m ago', type: 'r69' },
    { team: 'UNC', event: 'Won after R69', time: '5m ago', type: 'win' },
    { team: 'Kentucky', event: 'Lost lead', time: '8m ago', type: 'loss' },
  ]

  return (
    <Card className="relative bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
      {/* Update Indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 origin-left"
          />
        )}
      </AnimatePresence>

      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="relative">
              <Activity className="w-5 h-5 text-orange-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            Live Stats
          </CardTitle>
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                  {metric.trendValue && (
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{metric.trendValue}</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400">
                  {metric.label}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Recent Events Feed */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-400" />
            <h4 className="text-sm font-semibold text-white">Recent Events</h4>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recentEvents.map((event: RecentEvent, index: number) => (
                <motion.div
                  key={`${event.team}-${event.time}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className={`p-2 rounded-lg ${
                    event.type === 'r69' ? 'bg-orange-500/20' :
                    event.type === 'win' ? 'bg-green-500/20' :
                    'bg-red-500/20'
                  }`}>
                    <Trophy className={`w-4 h-4 ${
                      event.type === 'r69' ? 'text-orange-400' :
                      event.type === 'win' ? 'text-green-400' :
                      'text-red-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{event.team}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{event.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{event.event}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefresh && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Updates every {refreshInterval / 1000}s</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}
