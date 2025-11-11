'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TeamWithLogo } from '@/components/TeamLogo'
import { Trophy, TrendingUp, Target, Zap, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for now - this will be replaced with real API data
const mockTeamLeaders = [
  { rank: 1, team: 'Houston Cougars', conference: 'Big 12', r69Events: 12, r69Wins: 10, winRate: 83.3, avgMargin: 15.2 },
  { rank: 2, team: 'UConn Huskies', conference: 'Big East', r69Events: 11, r69Wins: 9, winRate: 81.8, avgMargin: 14.7 },
  { rank: 3, team: 'Purdue Boilermakers', conference: 'Big Ten', r69Events: 10, r69Wins: 8, winRate: 80.0, avgMargin: 13.5 },
  { rank: 4, team: 'Kansas Jayhawks', conference: 'Big 12', r69Events: 9, r69Wins: 7, winRate: 77.8, avgMargin: 12.9 },
  { rank: 5, team: 'Florida Gators', conference: 'SEC', r69Events: 8, r69Wins: 6, winRate: 75.0, avgMargin: 11.8 },
  { rank: 6, team: 'North Carolina Tar Heels', conference: 'ACC', r69Events: 8, r69Wins: 6, winRate: 75.0, avgMargin: 11.2 },
  { rank: 7, team: 'Duke Blue Devils', conference: 'ACC', r69Events: 7, r69Wins: 5, winRate: 71.4, avgMargin: 10.5 },
  { rank: 8, team: 'Arizona Wildcats', conference: 'Big 12', r69Events: 7, r69Wins: 5, winRate: 71.4, avgMargin: 10.1 },
  { rank: 9, team: 'UCLA Bruins', conference: 'Big Ten', r69Events: 6, r69Wins: 4, winRate: 66.7, avgMargin: 9.8 },
  { rank: 10, team: 'Auburn Tigers', conference: 'SEC', r69Events: 6, r69Wins: 4, winRate: 66.7, avgMargin: 9.3 },
]

const mockConferenceLeaders = [
  { rank: 1, conference: 'Big 12', r69Events: 45, r69Wins: 34, winRate: 75.6, teams: 14 },
  { rank: 2, conference: 'Big Ten', r69Events: 42, r69Wins: 31, winRate: 73.8, teams: 18 },
  { rank: 3, conference: 'SEC', r69Events: 40, r69Wins: 29, winRate: 72.5, teams: 16 },
  { rank: 4, conference: 'ACC', r69Events: 38, r69Wins: 27, winRate: 71.1, teams: 15 },
  { rank: 5, conference: 'Big East', r69Events: 28, r69Wins: 20, winRate: 71.4, teams: 11 },
]

const mockSpeedLeaders = [
  { rank: 1, team: 'Gonzaga Bulldogs', conference: 'WCC', avgTime: '8:42', fastestTime: '6:15', r69Events: 8 },
  { rank: 2, team: 'Michigan State Spartans', conference: 'Big Ten', avgTime: '9:05', fastestTime: '6:48', r69Events: 7 },
  { rank: 3, team: 'Louisville Cardinals', conference: 'ACC', avgTime: '9:18', fastestTime: '7:02', r69Events: 6 },
  { rank: 4, team: 'Wisconsin Badgers', conference: 'Big Ten', avgTime: '9:32', fastestTime: '7:21', r69Events: 7 },
  { rank: 5, team: 'Illinois Fighting Illini', conference: 'Big Ten', avgTime: '9:47', fastestTime: '7:35', r69Events: 6 },
]

export default function LeaderboardsPage() {
  const [selectedTab, setSelectedTab] = useState('teams')

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return null
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-amber-700 text-white'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pb-6 border-b">
            <div className="inline-flex items-center gap-3 mb-2">
              <Trophy className="h-12 w-12 text-victory-gold" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-basketball-orange to-court-green bg-clip-text text-transparent">
                Leaderboards
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top performers in the Race to 69 phenomenon across NCAA basketball
            </p>
          </div>

          {/* Leaderboard Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="teams">
                <Target className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="conferences">
                <TrendingUp className="h-4 w-4 mr-2" />
                Conferences
              </TabsTrigger>
              <TabsTrigger value="speed">
                <Zap className="h-4 w-4 mr-2" />
                Speed
              </TabsTrigger>
            </TabsList>

            {/* Teams Leaderboard */}
            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top R69W Teams</CardTitle>
                  <CardDescription>
                    Teams with the most Race to 69 wins this season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockTeamLeaders.map((team) => (
                      <div
                        key={team.rank}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                          team.rank <= 3 && 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <Badge className={getRankBadgeColor(team.rank)}>
                            #{team.rank}
                          </Badge>
                          {getRankIcon(team.rank)}
                        </div>

                        <div className="flex-1">
                          <TeamWithLogo
                            teamName={team.team}
                            logoUrl={null}
                            size="sm"
                            clickable={true}
                            nameClassName="font-semibold text-lg"
                          />
                          <div className="text-sm text-muted-foreground">{team.conference}</div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <div className="text-2xl font-bold text-r69w-success">{team.r69Wins}</div>
                            <div className="text-xs text-muted-foreground">R69 Wins</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{team.r69Events}</div>
                            <div className="text-xs text-muted-foreground">R69 Events</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-basketball-orange">{team.winRate}%</div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">+{team.avgMargin}</div>
                            <div className="text-xs text-muted-foreground">Avg Margin</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conferences Leaderboard */}
            <TabsContent value="conferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top R69W Conferences</CardTitle>
                  <CardDescription>
                    Conferences with the highest R69W success rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockConferenceLeaders.map((conf) => (
                      <div
                        key={conf.rank}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                          conf.rank <= 3 && 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <Badge className={getRankBadgeColor(conf.rank)}>
                            #{conf.rank}
                          </Badge>
                          {getRankIcon(conf.rank)}
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold text-lg">{conf.conference}</div>
                          <div className="text-sm text-muted-foreground">{conf.teams} teams</div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 text-center">
                          <div>
                            <div className="text-2xl font-bold text-r69w-success">{conf.r69Wins}</div>
                            <div className="text-xs text-muted-foreground">R69 Wins</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{conf.r69Events}</div>
                            <div className="text-xs text-muted-foreground">R69 Events</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-basketball-orange">{conf.winRate}%</div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Speed Leaderboard */}
            <TabsContent value="speed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fastest to 69</CardTitle>
                  <CardDescription>
                    Teams that reach 69 points the fastest on average
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockSpeedLeaders.map((team) => (
                      <div
                        key={team.rank}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                          team.rank <= 3 && 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <Badge className={getRankBadgeColor(team.rank)}>
                            #{team.rank}
                          </Badge>
                          {getRankIcon(team.rank)}
                        </div>

                        <div className="flex-1">
                          <TeamWithLogo
                            teamName={team.team}
                            logoUrl={null}
                            size="sm"
                            clickable={true}
                            nameClassName="font-semibold text-lg"
                          />
                          <div className="text-sm text-muted-foreground">{team.conference}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 text-center">
                          <div>
                            <div className="text-2xl font-bold text-basketball-orange">{team.avgTime}</div>
                            <div className="text-xs text-muted-foreground">Avg Time</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-r69w-success">{team.fastestTime}</div>
                            <div className="text-xs text-muted-foreground">Fastest</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{team.r69Events}</div>
                            <div className="text-xs text-muted-foreground">R69 Events</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-basketball-orange/10 via-court-green/10 to-victory-gold/10 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Trophy className="h-8 w-8 text-basketball-orange flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">About These Leaderboards</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These rankings show teams and conferences with the highest success rates when reaching 69 points first while leading.
                    The Speed leaderboard tracks how quickly teams reach this milestone, measured in game time.
                    Rankings are updated in real-time as games are completed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
