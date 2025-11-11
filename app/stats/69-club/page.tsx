'use client'

export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TeamWithLogo } from '@/components/TeamLogo'
import { Trophy, Target, TrendingUp, Flame, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - will be replaced with real API data
const eliteTeams = [
  {
    id: 1,
    team: 'Houston Cougars',
    conference: 'Big 12',
    r69Wins: 10,
    r69Events: 12,
    winRate: 83.3,
    perfectStreak: 5,
    avgMargin: 15.2,
    logo: '🐾',
    tier: 'platinum'
  },
  {
    id: 2,
    team: 'UConn Huskies',
    conference: 'Big East',
    r69Wins: 9,
    r69Events: 11,
    winRate: 81.8,
    perfectStreak: 4,
    avgMargin: 14.7,
    logo: '🐺',
    tier: 'platinum'
  },
  {
    id: 3,
    team: 'Purdue Boilermakers',
    conference: 'Big Ten',
    r69Wins: 8,
    r69Events: 10,
    winRate: 80.0,
    perfectStreak: 3,
    avgMargin: 13.5,
    logo: '🚂',
    tier: 'gold'
  },
  {
    id: 4,
    team: 'Kansas Jayhawks',
    conference: 'Big 12',
    r69Wins: 7,
    r69Events: 9,
    winRate: 77.8,
    perfectStreak: 3,
    avgMargin: 12.9,
    logo: '🦅',
    tier: 'gold'
  },
  {
    id: 5,
    team: 'Florida Gators',
    conference: 'SEC',
    r69Wins: 6,
    r69Events: 8,
    winRate: 75.0,
    perfectStreak: 2,
    avgMargin: 11.8,
    logo: '🐊',
    tier: 'silver'
  },
  {
    id: 6,
    team: 'North Carolina Tar Heels',
    conference: 'ACC',
    r69Wins: 6,
    r69Events: 8,
    winRate: 75.0,
    perfectStreak: 2,
    avgMargin: 11.2,
    logo: '👟',
    tier: 'silver'
  },
]

const getTierInfo = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return {
        name: 'Platinum',
        color: 'from-cyan-400 to-blue-500',
        badgeColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
        icon: <Star className="h-5 w-5" />,
        requirement: '80%+ win rate',
      }
    case 'gold':
      return {
        name: 'Gold',
        color: 'from-yellow-400 to-orange-500',
        badgeColor: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
        icon: <Trophy className="h-5 w-5" />,
        requirement: '75-79% win rate',
      }
    case 'silver':
      return {
        name: 'Silver',
        color: 'from-gray-300 to-gray-500',
        badgeColor: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
        icon: <Target className="h-5 w-5" />,
        requirement: '70-74% win rate',
      }
    default:
      return {
        name: 'Member',
        color: 'from-muted to-muted',
        badgeColor: 'bg-muted text-muted-foreground',
        icon: <Target className="h-5 w-5" />,
        requirement: '65%+ win rate',
      }
  }
}

export default function Club69Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pb-6 border-b">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-basketball-orange via-victory-gold to-court-green flex items-center justify-center animate-pulse-r69">
                <span className="text-3xl font-bold text-white">69</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-basketball-orange to-court-green bg-clip-text text-transparent">
                The 69 Club
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Elite teams that have mastered the Race to 69 phenomenon with exceptional win rates
            </p>
          </div>

          {/* Tier Legend */}
          <Card className="bg-gradient-to-r from-muted/30 to-muted/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-victory-gold" />
                Membership Tiers
              </CardTitle>
              <CardDescription>
                Teams are ranked based on their R69W win rate throughout the season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['platinum', 'gold', 'silver'].map((tier) => {
                  const info = getTierInfo(tier)
                  return (
                    <div
                      key={tier}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={info.badgeColor}>
                          {info.icon}
                          <span className="ml-2">{info.name}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{info.requirement}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Elite Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {eliteTeams.map((team, index) => {
              const tierInfo = getTierInfo(team.tier)
              return (
                <Card
                  key={team.id}
                  className={cn(
                    'overflow-hidden hover:shadow-xl transition-all hover:scale-105',
                    index < 2 && 'ring-2 ring-victory-gold'
                  )}
                >
                  {/* Tier Banner */}
                  <div className={cn(
                    'h-2 bg-gradient-to-r',
                    tierInfo.color
                  )} />

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{team.logo}</div>
                        <div>
                          <TeamWithLogo
                            teamName={team.team}
                            logoUrl={null}
                            size="md"
                            clickable={true}
                            nameClassName="text-2xl mb-1"
                          />
                          <CardDescription className="text-base">{team.conference}</CardDescription>
                        </div>
                      </div>
                      <Badge className={tierInfo.badgeColor}>
                        {tierInfo.icon}
                        <span className="ml-2">{tierInfo.name}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Main Stats */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-r69w-success to-court-green bg-clip-text text-transparent">
                          {team.r69Wins}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">R69 Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-basketball-orange">
                          {team.winRate}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
                      </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xl font-bold">{team.r69Events}</div>
                        <div className="text-xs text-muted-foreground">R69 Events</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-center gap-1 text-xl font-bold">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {team.perfectStreak}
                        </div>
                        <div className="text-xs text-muted-foreground">Best Streak</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xl font-bold">+{team.avgMargin}</div>
                        <div className="text-xs text-muted-foreground">Avg Margin</div>
                      </div>
                    </div>

                    {/* Achievement Badges */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {team.perfectStreak >= 5 && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot Streak
                        </Badge>
                      )}
                      {team.winRate >= 80 && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Star className="h-3 w-3 mr-1" />
                          Elite Status
                        </Badge>
                      )}
                      {team.r69Wins >= 8 && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Consistent Winner
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-basketball-orange/20 via-court-green/20 to-victory-gold/20 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Trophy className="h-8 w-8 text-victory-gold flex-shrink-0" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">About The 69 Club</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The 69 Club recognizes teams that have demonstrated exceptional performance in the Race to 69 phenomenon.
                    To qualify, teams must have achieved at least 5 R69 events during the season with a minimum 65% win rate.
                    Membership tiers are awarded based on overall R69W win percentage.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Requirements:</span>
                    <Badge variant="outline">5+ R69 Events</Badge>
                    <Badge variant="outline">65%+ Win Rate</Badge>
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
