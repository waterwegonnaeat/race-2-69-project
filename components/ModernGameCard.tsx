'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy, TrendingUp, TrendingDown, Clock, Flame, Zap,
  Eye, Target, Activity, ChevronRight, Medal, Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TeamLogo } from './TeamLogo'

interface ModernGameCardProps {
  game: any
  viewMode: 'grid' | 'list'
}

export function ModernGameCard({ game, viewMode }: ModernGameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const homeR69Progress = (game.homeScore / 69) * 100
  const awayR69Progress = (game.awayScore / 69) * 100

  const homeReached69First = game.r69Event?.teamId === game.homeTeamId && game.homeScore >= 69
  const awayReached69First = game.r69Event?.teamId === game.awayTeamId && game.awayScore >= 69

  const isLive = game.status === 'live'
  const isFinal = game.status === 'final'
  const isUpcoming = game.status === 'upcoming'

  // Calculate excitement level (0-100)
  const calculateExcitement = () => {
    let excitement = 0
    const scoreDiff = Math.abs(game.homeScore - game.awayScore)

    // Close game = high excitement
    if (scoreDiff <= 5) excitement += 40
    else if (scoreDiff <= 10) excitement += 20

    // Both teams near 69 = high excitement
    if (homeR69Progress > 80 && awayR69Progress > 80) excitement += 30
    else if (homeR69Progress > 90 || awayR69Progress > 90) excitement += 20

    // Live games = more exciting
    if (isLive) excitement += 30

    return Math.min(excitement, 100)
  }

  const excitementLevel = calculateExcitement()
  const isHighExcitement = excitementLevel >= 70

  if (viewMode === 'list') {
    return (
      <Link href={`/game/${game.id}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {isLive && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 text-xs font-bold">LIVE</span>
                    </div>
                  )}
                  {isFinal && (
                    <Badge variant="outline" className="border-white/20 text-slate-400">
                      Final
                    </Badge>
                  )}
                  {isUpcoming && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{game.startTime}</span>
                    </div>
                  )}
                </div>

                {/* Teams */}
                <div className="flex-1 grid grid-cols-2 gap-8">
                  {/* Away Team */}
                  <div className="flex items-center gap-3">
                    <TeamLogo teamName={game.awayTeam} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{game.awayTeam}</span>
                        {awayReached69First && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5">
                            69 FIRST
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">{game.awayScore}</span>
                        <Progress value={awayR69Progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-slate-400">{Math.round(awayR69Progress)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center gap-3">
                    <TeamLogo teamName={game.homeTeam} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{game.homeTeam}</span>
                        {homeReached69First && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5">
                            69 FIRST
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">{game.homeScore}</span>
                        <Progress value={homeR69Progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-slate-400">{Math.round(homeR69Progress)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Excitement Meter */}
                {isHighExcitement && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-orange-400 text-xs font-bold">HOT</span>
                  </div>
                )}

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    )
  }

  // Grid View
  return (
    <Link href={`/game/${game.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Card className="relative bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden group h-full">
          {/* Gradient Overlay on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
            animate={{ opacity: isHovered ? 0.1 : 0 }}
          />

          {/* Live Indicator */}
          {isLive && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          )}

          {/* Excitement Badge */}
          {isHighExcitement && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full">
              <Flame className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-bold">HOT</span>
            </div>
          )}

          <CardContent className="p-6">
            {/* Game Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-400">
                {isLive && <span className="text-orange-400 font-medium">{game.period} • {game.clock}</span>}
                {isFinal && <span>Final</span>}
                {isUpcoming && <span>{game.startTime}</span>}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{game.viewers || '2.4K'}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <TeamLogo teamName={game.awayTeam} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{game.awayTeam}</span>
                    {awayReached69First && (
                      <Trophy className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{game.awayRecord || '0-0'}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{game.awayScore}</div>
                </div>
              </div>

              {/* R69 Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Race to 69</span>
                  <span className={`font-medium ${awayR69Progress >= 100 ? 'text-orange-400' : 'text-slate-400'}`}>
                    {Math.round(awayR69Progress)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      awayR69Progress >= 100 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(awayR69Progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-bold text-slate-500">VS</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Home Team */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <TeamLogo teamName={game.homeTeam} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{game.homeTeam}</span>
                    {homeReached69First && (
                      <Trophy className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{game.homeRecord || '0-0'}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{game.homeScore}</div>
                </div>
              </div>

              {/* R69 Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Race to 69</span>
                  <span className={`font-medium ${homeR69Progress >= 100 ? 'text-orange-400' : 'text-slate-400'}`}>
                    {Math.round(homeR69Progress)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      homeR69Progress >= 100 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(homeR69Progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <Activity className="w-3 h-3" />
                  <span>{game.pace || '72'} Pace</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Target className="w-3 h-3" />
                  <span>{game.leadChanges || '8'} Changes</span>
                </div>
              </div>

              {game.conference && (
                <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                  {game.conference}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
