'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TeamWithLogo } from '@/components/TeamLogo'
import { Frown, TrendingDown, AlertTriangle, Calendar, Target, X, Home, Trophy, BarChart3, Sparkles, Menu, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock data - will be replaced with real API data
const premature69Games = [
  {
    id: '1',
    gameId: 'game-p1',
    date: '2024-11-06',
    team: 'Michigan State Spartans',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
    opponent: 'Oakland Golden Grizzlies',
    opponentLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png',
    finalScore: '78-82',
    teamScore: 78,
    opponentScore: 82,
    r69Margin: 8,
    r69Time: '11:23',
    r69Period: 2,
    finalMargin: -4,
    blownLead: 12,
    venue: 'Breslin Center',
    conference: 'Big Ten',
    shameFactor: 'high', // Lost after leading by 12
  },
  {
    id: '2',
    gameId: 'game-p2',
    date: '2024-11-05',
    team: 'Villanova Wildcats',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/222.png',
    opponent: 'BYU Cougars',
    opponentLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/252.png',
    finalScore: '72-76',
    teamScore: 72,
    opponentScore: 76,
    r69Margin: 5,
    r69Time: '9:47',
    r69Period: 2,
    finalMargin: -4,
    blownLead: 9,
    venue: 'Wells Fargo Center',
    conference: 'Big East',
    shameFactor: 'medium',
  },
  {
    id: '3',
    gameId: 'game-p3',
    date: '2024-11-04',
    team: 'Texas Tech Red Raiders',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png',
    opponent: 'Lincoln Blue Tigers',
    opponentLogo: null,
    finalScore: '84-88',
    teamScore: 84,
    opponentScore: 88,
    r69Margin: 11,
    r69Time: '8:15',
    r69Period: 1,
    finalMargin: -4,
    blownLead: 15,
    venue: 'United Supermarkets Arena',
    conference: 'Big 12',
    shameFactor: 'critical', // Huge blown lead
  },
  {
    id: '4',
    gameId: 'game-p4',
    date: '2024-11-03',
    team: 'Wisconsin Badgers',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png',
    opponent: 'Cameron Aggies',
    opponentLogo: null,
    finalScore: '71-73',
    teamScore: 71,
    opponentScore: 73,
    r69Margin: 6,
    r69Time: '10:52',
    r69Period: 2,
    finalMargin: -2,
    blownLead: 8,
    venue: 'Kohl Center',
    conference: 'Big Ten',
    shameFactor: 'medium',
  },
]

const stats = {
  totalPremature: 38,
  thisWeek: 4,
  avgBlownLead: 10.2,
  biggestCollapse: 18,
}

const getShameLevel = (shameFactor: string) => {
  switch (shameFactor) {
    case 'critical':
      return {
        label: 'CRITICAL SHAME',
        color: 'bg-red-600 text-white',
        icon: '🔥',
        description: 'Blew a massive lead',
      }
    case 'high':
      return {
        label: 'HIGH SHAME',
        color: 'bg-orange-500 text-white',
        icon: '😬',
        description: 'Significant collapse',
      }
    case 'medium':
      return {
        label: 'MODERATE SHAME',
        color: 'bg-yellow-500 text-black',
        icon: '😐',
        description: 'Disappointing finish',
      }
    default:
      return {
        label: 'MINOR SHAME',
        color: 'bg-gray-400 text-white',
        icon: '😕',
        description: 'Close loss',
      }
  }
}

export default function Premature69Page() {
  const [menuOpen, setMenuOpen] = useState(false)


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f0a] via-[#2a1810] to-[#3a2418]">
      {/* Floating Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Target className="h-6 w-6 text-basketball-orange" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-basketball-orange bg-clip-text text-transparent">
              Race to 69
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/#overview"
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/#leaderboards"
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Leaderboards
            </Link>
            <Link
              href="/#statistics"
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Statistics
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-basketball-orange to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-basketball-orange/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Main
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                href="/"
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/#overview"
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <Sparkles className="h-4 w-4" />
                Overview
              </Link>
              <Link
                href="/#leaderboards"
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <Trophy className="h-4 w-4" />
                Leaderboards
              </Link>
              <Link
                href="/#statistics"
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <BarChart3 className="h-4 w-4" />
                Statistics
              </Link>
              <Link
                href="/"
                className="w-full text-left px-4 py-2 bg-gradient-to-r from-basketball-orange to-orange-600 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="container pt-28 pb-20 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pb-6 border-b border-white/10">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Frown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Premature 69 Hall of Shame
              </h1>
            </div>
            <p className="text-lg text-sunrise-glow/70 max-w-2xl mx-auto">
              Teams that reached 69 first, only to lose the game - The rare but devastating R69 losses
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-red-600/30 bg-gradient-to-br from-red-600/10 to-red-600/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Total Shameful Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.totalPremature}</div>
                <p className="text-xs text-white/60 mt-1">This season</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-basketball-orange" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.thisWeek}</div>
                <p className="text-xs text-white/60 mt-1">Premature 69s</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                  <TrendingDown className="h-4 w-4 text-orange-400" />
                  Avg Blown Lead
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">{stats.avgBlownLead}</div>
                <p className="text-xs text-white/60 mt-1">Points squandered</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                  <X className="h-4 w-4 text-red-500" />
                  Biggest Collapse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.biggestCollapse}</div>
                <p className="text-xs text-white/60 mt-1">Point lead blown</p>
              </CardContent>
            </Card>
          </div>

          {/* Warning Banner */}
          <Card className="bg-white/5 backdrop-blur-xl border-2 border-red-600/30 bg-gradient-to-r from-red-600/20 to-orange-600/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-red-500 mb-2">⚠️ The Curse of Premature 69</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    These teams reached 69 first but couldn't close the deal. Despite being first to the magic number,
                    they ultimately lost the game. A reminder that while reaching 69 first is powerful, it's not a guarantee -
                    the game isn't over until the final buzzer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Games List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              Recent Shameful Performances
              <Badge variant="outline" className="bg-red-600/20 border-red-600/40 text-red-400">
                😬 Yikes
              </Badge>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {premature69Games.map((game) => {
                const shameLevel = getShameLevel(game.shameFactor)
                return (
                  <Card
                    key={game.id}
                    className="bg-white/5 backdrop-blur-xl border-red-600/30 overflow-hidden hover:shadow-xl hover:border-red-500/50 transition-all"
                  >
                    <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-6">
                        {/* Game Info */}
                        <div className="flex-1 space-y-3">
                          {/* Date & Venue */}
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(game.date)}</span>
                            </div>
                            <span>•</span>
                            <span className="truncate max-w-[300px]">{game.venue}</span>
                            <Badge variant="outline">{game.conference}</Badge>
                            <Badge className={shameLevel.color}>
                              {shameLevel.icon} {shameLevel.label}
                            </Badge>
                          </div>

                          {/* Teams & Score */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <X className="h-5 w-5 text-red-600" />
                                <TeamWithLogo
                                  teamName={game.team}
                                  logoUrl={game.teamLogo}
                                  size="sm"
                                  clickable={true}
                                  nameClassName="font-semibold text-lg text-white"
                                />
                              </div>
                              <span className="text-2xl font-bold text-red-600">{game.teamScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="ml-8">
                                <TeamWithLogo
                                  teamName={game.opponent}
                                  logoUrl={game.opponentLogo}
                                  size="sm"
                                  clickable={true}
                                  nameClassName="font-semibold text-lg text-white"
                                />
                              </div>
                              <span className="text-2xl font-bold text-r69w-success">{game.opponentScore}</span>
                            </div>
                          </div>

                          {/* Shame Details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-red-600/10 rounded-lg border border-red-600/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-semibold text-red-500">Hit 69 First</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white">
                                <span>Period {game.r69Period}</span>
                                <span>•</span>
                                <span>{game.r69Time}</span>
                                <span>•</span>
                                <span className="font-bold">{game.r69Margin > 0 ? '+' : ''}{game.r69Margin}</span>
                              </div>
                            </div>

                            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingDown className="h-4 w-4 text-orange-400" />
                                <span className="text-xs font-semibold text-orange-400">The Collapse</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-bold text-orange-400">Blew {game.blownLead}-point lead</span>
                                <span className="text-white/60 ml-2">
                                  • Lost by {Math.abs(game.finalMargin)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shame Description */}
                          <div className="text-sm text-white/60 italic">
                            {shameLevel.description} - {game.team} had all the momentum but couldn't close it out
                          </div>
                        </div>

                        {/* Shame Badge */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center relative">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white line-through">69</div>
                              <div className="text-xs text-white/90 font-bold">SHAME</div>
                            </div>
                            <div className="absolute -top-1 -right-1 h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                              <X className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <Link href={`/game/${game.gameId}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Game
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-white/5 backdrop-blur-xl border-2 border-red-600/30 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Frown className="h-8 w-8 text-red-500 flex-shrink-0" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-white">The Lesson of Premature 69</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    While reaching 69 first typically results in a win (~73%), these games serve as a stark
                    reminder that statistics don't guarantee victory. Whether they were ahead or behind when they hit 69,
                    these teams couldn't convert the R69 advantage into a win, providing valuable lessons about
                    maintaining momentum and finishing games strong.
                  </p>
                  <div className="flex items-center gap-2 text-sm pt-2 text-red-500 font-semibold">
                    <TrendingDown className="h-4 w-4" />
                    <span>
                      Only {((stats.totalPremature / (stats.totalPremature + 142)) * 100).toFixed(1)}% of R69 events
                      end in defeat - these teams are the unfortunate few.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-basketball-orange" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-basketball-orange bg-clip-text text-transparent">
              Race to 69
            </span>
          </div>
          <p className="text-white/40 text-sm">
            NCAA Division I Basketball Analytics • R69W Phenomenon Tracker
          </p>
        </div>
      </footer>
    </div>
  )
}
