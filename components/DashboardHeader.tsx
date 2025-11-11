'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Target, Activity, Sparkles } from 'lucide-react'
import { TeamLogo } from './TeamLogo'

interface DashboardHeaderProps {
  teamName: string
  teamLogo?: string | null
  totalSeasons: number
  stats: {
    totalGames: number
    wins: number
    losses: number
    r69Events: number
  }
}

export function DashboardHeader({ teamName, teamLogo, totalSeasons, stats }: DashboardHeaderProps) {
  const winPercentage = stats.totalGames > 0
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
    : '0'

  const r69Rate = stats.totalGames > 0
    ? ((stats.r69Events / stats.totalGames) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="p-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-900/50 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <TeamLogo
                teamName={teamName}
                logoUrl={teamLogo}
                size="xl"
                clickable={false}
                className="flex-shrink-0"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {teamName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">{totalSeasons} {totalSeasons === 1 ? 'Season' : 'Seasons'}</span>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <span>{stats.totalGames} Games</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* Quick Stats */}
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Win Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{winPercentage}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">R69 Events</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.r69Events}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">R69 Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{r69Rate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Record</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.wins}-{stats.losses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
