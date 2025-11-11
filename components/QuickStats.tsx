'use client'

import { motion } from 'framer-motion'
import {
  Trophy, TrendingUp, Zap, Activity, Flame, Target,
  Users, BarChart3, Clock, Award
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface QuickStatsProps {
  stats: any
  isLoading: boolean
}

export function QuickStats({ stats, isLoading }: QuickStatsProps) {
  const statCards = [
    {
      title: 'Live Games',
      value: stats?.liveGames || 0,
      change: '+3',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      pulse: true,
    },
    {
      title: 'R69 Events Today',
      value: stats?.r69EventsToday || 0,
      change: '+12',
      icon: Trophy,
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Win Rate',
      value: stats?.winRate ? `${stats.winRate.toFixed(1)}%` : '73.2%',
      change: '+1.2%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Avg Time to 69',
      value: stats?.avgTimeTo69 || '22:34',
      change: '-45s',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Hot Streaks',
      value: stats?.hotStreaks || 8,
      change: '+2',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Excitement Score',
      value: stats?.excitementScore || 87,
      change: '+5',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative bg-white/5 backdrop-blur-sm border ${stat.borderColor} hover:border-opacity-50 transition-all cursor-pointer group overflow-hidden`}>
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

              {/* Pulse Effect for Live Games */}
              {stat.pulse && (
                <div className="absolute top-3 right-3">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <div className="relative w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                </div>
              )}

              <CardContent className="p-4 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  {stat.change && (
                    <span className={`text-xs font-medium ${
                      stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {stat.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
