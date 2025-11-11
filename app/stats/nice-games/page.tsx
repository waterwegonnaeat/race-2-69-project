'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TeamWithLogo } from '@/components/TeamLogo'
import { PartyPopper, Sparkles, Trophy, Calendar, Target, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock data - will be replaced with real API data
const niceGames = [
  {
    id: '1',
    gameId: 'game-1',
    date: '2024-11-07',
    homeTeam: 'Houston Cougars',
    awayTeam: 'Lehigh Mountain Hawks',
    homeScore: 75,
    awayScore: 57,
    finalScore: '75-57',
    r69Team: 'Houston Cougars',
    r69Time: '8:42',
    r69Period: 2,
    r69Margin: 12,
    r69Won: true,
    niceScore: 69,
    venue: 'Fertitta Center',
    conference: 'Big 12',
  },
  {
    id: '2',
    gameId: 'game-2',
    date: '2024-11-06',
    homeTeam: 'Florida Gators',
    awayTeam: 'North Florida Ospreys',
    homeScore: 104,
    awayScore: 64,
    finalScore: '104-64',
    r69Team: 'Florida Gators',
    r69Time: '7:15',
    r69Period: 1,
    r69Margin: 18,
    r69Won: true,
    niceScore: 69,
    venue: "Stephen C. O'Connell Center",
    conference: 'SEC',
  },
  {
    id: '3',
    gameId: 'game-3',
    date: '2024-11-05',
    homeTeam: 'Creighton Bluejays',
    awayTeam: 'South Dakota Coyotes',
    homeScore: 92,
    awayScore: 76,
    finalScore: '92-76',
    r69Team: 'Creighton Bluejays',
    r69Time: '9:32',
    r69Period: 2,
    r69Margin: 8,
    r69Won: true,
    niceScore: 69,
    venue: 'CHI Health Center Omaha',
    conference: 'Big East',
  },
  {
    id: '4',
    gameId: 'game-4',
    date: '2024-11-04',
    homeTeam: 'Purdue Boilermakers',
    awayTeam: 'Evansville Purple Aces',
    homeScore: 82,
    awayScore: 51,
    finalScore: '82-51',
    r69Team: 'Purdue Boilermakers',
    r69Time: '6:48',
    r69Period: 1,
    r69Margin: 21,
    r69Won: true,
    niceScore: 69,
    venue: 'Mackey Arena',
    conference: 'Big Ten',
  },
  {
    id: '5',
    gameId: 'game-5',
    date: '2024-11-03',
    homeTeam: 'Kansas Jayhawks',
    awayTeam: 'Green Bay Phoenix',
    homeScore: 87,
    awayScore: 63,
    finalScore: '87-63',
    r69Team: 'Kansas Jayhawks',
    r69Time: '10:15',
    r69Period: 2,
    r69Margin: 14,
    r69Won: true,
    niceScore: 69,
    venue: 'Allen Fieldhouse',
    conference: 'Big 12',
  },
]

const stats = {
  totalNiceGames: 142,
  thisWeek: 5,
  r69WinRate: 78.9,
  avgMargin: 13.4,
}

export default function NiceGamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pb-6 border-b">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-court-green via-victory-gold to-basketball-orange flex items-center justify-center animate-pulse-r69">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-court-green to-victory-gold bg-clip-text text-transparent">
                Nice Games
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Games where teams finish with exactly 69 points - A celebration of basketball's most satisfying number
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-court-green/10 to-court-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-court-green" />
                  Total Nice Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-court-green">{stats.totalNiceGames}</div>
                <p className="text-xs text-muted-foreground mt-1">This season</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.thisWeek}</div>
                <p className="text-xs text-muted-foreground mt-1">Nice games</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-r69w-success">{stats.r69WinRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">R69W success</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Avg Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+{stats.avgMargin}</div>
                <p className="text-xs text-muted-foreground mt-1">Points at 69</p>
              </CardContent>
            </Card>
          </div>

          {/* Games List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Nice Games</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2 text-court-green" />
                Nice! 🎉
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {niceGames.map((game) => (
                <Card
                  key={game.id}
                  className="overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="h-1 bg-gradient-to-r from-court-green via-victory-gold to-basketball-orange" />

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-6">
                      {/* Game Info */}
                      <div className="flex-1 space-y-3">
                        {/* Date & Venue */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(game.date)}</span>
                          </div>
                          <span>•</span>
                          <span className="truncate max-w-[300px]">{game.venue}</span>
                          <Badge variant="outline">{game.conference}</Badge>
                        </div>

                        {/* Teams & Score */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <TeamWithLogo
                                teamName={game.homeTeam}
                                logoUrl={null}
                                size="sm"
                                clickable={true}
                                nameClassName="font-semibold"
                              />
                              <span className="text-2xl font-bold">{game.homeScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <TeamWithLogo
                                teamName={game.awayTeam}
                                logoUrl={null}
                                size="sm"
                                clickable={true}
                                nameClassName="font-semibold"
                              />
                              <span className="text-2xl font-bold">{game.awayScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* R69 Details */}
                        <div className="flex items-center gap-4 p-3 bg-court-green/10 rounded-lg border border-court-green/20">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-court-green" />
                            <TeamWithLogo
                              teamName={game.r69Team}
                              logoUrl={null}
                              size="xs"
                              clickable={true}
                              nameClassName="font-semibold text-court-green"
                            />
                          </div>
                          <span className="text-muted-foreground">hit</span>
                          <span className="text-2xl font-bold text-court-green">69</span>
                          <span className="text-muted-foreground">in Period {game.r69Period}</span>
                          <Badge variant="outline" className="bg-court-green/10 border-court-green/30">
                            {game.r69Time}
                          </Badge>
                          <Badge variant="outline" className="bg-court-green/10 border-court-green/30">
                            +{game.r69Margin} lead
                          </Badge>
                          {game.r69Won && (
                            <Badge className="bg-r69w-success text-white">
                              <Trophy className="h-3 w-3 mr-1" />
                              Won
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Nice Badge */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-court-green to-victory-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-white">69</div>
                            <div className="text-xs text-white/90">NICE!</div>
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
              ))}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-court-green/20 via-victory-gold/20 to-basketball-orange/20 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <PartyPopper className="h-8 w-8 text-court-green flex-shrink-0" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Why 69 is Nice</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In basketball culture, finishing with exactly 69 points is considered a fun milestone. This page celebrates
                    all the games where teams achieved this "nice" final score, combining the statistical
                    significance of the R69W phenomenon with the cultural appreciation of this special number.
                  </p>
                  <div className="flex items-center gap-2 text-sm pt-2">
                    <Sparkles className="h-4 w-4 text-court-green" />
                    <span className="font-semibold">
                      Teams that hit 69 first win {stats.r69WinRate}% of the time - that's pretty nice!
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
