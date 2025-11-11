'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Medal, Crown, Star, Flame } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area
} from 'recharts'
import { TeamWithLogo } from '@/components/TeamLogo'

// Mock leaderboard data with logo URLs
const topTeams = [
  { rank: 1, team: 'Houston Cougars', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png', conference: 'Big 12', r69Events: 15, r69Wins: 13, r69wRate: 86.7, avgMargin: 14.2, streak: 'W5' },
  { rank: 2, team: 'UConn Huskies', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png', conference: 'Big East', r69Events: 14, r69Wins: 12, r69wRate: 85.7, avgMargin: 13.8, streak: 'W4' },
  { rank: 3, team: 'Purdue Boilermakers', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png', conference: 'Big Ten', r69Events: 13, r69Wins: 11, r69wRate: 84.6, avgMargin: 13.1, streak: 'W3' },
  { rank: 4, team: 'Kansas Jayhawks', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png', conference: 'Big 12', r69Events: 12, r69Wins: 10, r69wRate: 83.3, avgMargin: 12.5, streak: 'L1' },
  { rank: 5, team: 'Duke Blue Devils', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png', conference: 'ACC', r69Events: 11, r69Wins: 9, r69wRate: 81.8, avgMargin: 11.9, streak: 'W2' },
  { rank: 6, team: 'Arizona Wildcats', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png', conference: 'Big 12', r69Events: 12, r69Wins: 9, r69wRate: 75.0, avgMargin: 10.8, streak: 'W1' },
  { rank: 7, team: 'Tennessee Volunteers', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png', conference: 'SEC', r69Events: 13, r69Wins: 9, r69wRate: 69.2, avgMargin: 9.5, streak: 'L2' },
  { rank: 8, team: 'Kentucky Wildcats', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png', conference: 'SEC', r69Events: 10, r69Wins: 7, r69wRate: 70.0, avgMargin: 10.2, streak: 'W1' },
  { rank: 9, team: 'North Carolina Tar Heels', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png', conference: 'ACC', r69Events: 11, r69Wins: 7, r69wRate: 63.6, avgMargin: 8.7, streak: 'L1' },
  { rank: 10, team: 'Marquette Golden Eagles', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/269.png', conference: 'Big East', r69Events: 9, r69Wins: 6, r69wRate: 66.7, avgMargin: 9.1, streak: 'W2' },
]

const conferenceStandings = [
  { rank: 1, conference: 'Big 12', r69Events: 234, r69Wins: 178, r69wRate: 76.1, teams: 14, avgMargin: 12.3 },
  { rank: 2, conference: 'Big Ten', r69Events: 256, r69Wins: 189, r69wRate: 73.8, teams: 18, avgMargin: 11.8 },
  { rank: 3, conference: 'SEC', r69Events: 245, r69Wins: 178, r69wRate: 72.7, teams: 16, avgMargin: 11.2 },
  { rank: 4, conference: 'Big East', r69Events: 156, r69Wins: 114, r69wRate: 73.1, teams: 11, avgMargin: 11.5 },
  { rank: 5, conference: 'ACC', r69Events: 178, r69Wins: 126, r69wRate: 70.8, teams: 15, avgMargin: 10.6 },
]

const topRisers = [
  { team: 'Houston Cougars', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png', change: +5, r69wRate: 86.7, prevRate: 72.1 },
  { team: 'UConn Huskies', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png', change: +3, r69wRate: 85.7, prevRate: 78.3 },
  { team: 'Purdue Boilermakers', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png', change: +2, r69wRate: 84.6, prevRate: 79.8 },
]

const topFallers = [
  { team: 'North Carolina Tar Heels', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png', change: -4, r69wRate: 63.6, prevRate: 81.2 },
  { team: 'Tennessee Volunteers', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png', change: -3, r69wRate: 69.2, prevRate: 78.5 },
  { team: 'Michigan State Spartans', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png', change: -2, r69wRate: 68.1, prevRate: 74.3 },
]

const hotTeams = [
  { team: 'Houston Cougars', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png', streak: 'W5', last10: '9-1', r69wRate: 90.0 },
  { team: 'UConn Huskies', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png', streak: 'W4', last10: '8-2', r69wRate: 87.5 },
  { team: 'Purdue Boilermakers', logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png', streak: 'W3', last10: '7-3', r69wRate: 85.0 },
]

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <Star className="h-4 w-4 text-muted-foreground" />
}

const getRankBadge = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500'
  if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700'
  return 'bg-muted'
}

export function LeaderboardDashboard() {
  return (
    <div className="space-y-6">
      {/* Top 10 Teams */}
      <Card className="border-basketball-orange/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-basketball-orange" />
            Top 10 Teams by R69W Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topTeams.map((team) => (
              <div
                key={team.rank}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-lg ${
                  team.rank <= 3 ? 'border-basketball-orange/30 bg-basketball-orange/5' : 'border-border/50 bg-card/50'
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getRankBadge(team.rank)} flex items-center justify-center font-bold text-white shadow-lg`}>
                  {team.rank <= 3 ? getRankIcon(team.rank) : team.rank}
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <TeamWithLogo
                      teamName={team.team}
                      logoUrl={team.logoUrl}
                      size="md"
                      clickable={true}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg truncate">{team.team}</h3>
                        {team.rank <= 3 && (
                          <Badge variant="outline" className="border-basketball-orange text-basketball-orange">
                            Elite
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{team.conference}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{team.r69wRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">R69W Rate</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-lg font-semibold">{team.r69Wins}/{team.r69Events}</div>
                    <div className="text-xs text-muted-foreground">W-L</div>
                  </div>
                  <div className="text-center hidden lg:block">
                    <div className="text-lg font-semibold text-blue-500">+{team.avgMargin.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Avg Margin</div>
                  </div>
                  <Badge variant={team.streak.startsWith('W') ? 'default' : 'destructive'} className="hidden xl:block">
                    {team.streak}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conference Standings & Hot Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conference Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-basketball-orange" />
              Conference Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conferenceStandings.map((conf) => (
                <div key={conf.rank} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-basketball-orange/20 flex items-center justify-center font-bold text-sm">
                    {conf.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{conf.conference}</div>
                    <div className="text-xs text-muted-foreground">{conf.teams} teams • {conf.r69Events} R69 events</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">{conf.r69wRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">{conf.r69Wins} wins</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conference Chart */}
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={conferenceStandings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="conference" stroke="#888" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888" domain={[65, 80]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="r69wRate" name="R69W Rate (%)" fill="#FF6B35" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hot Teams & Risers/Fallers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Hot Teams & Movers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hot Teams */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">On Fire 🔥</h4>
              <div className="space-y-2">
                {hotTeams.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <TeamWithLogo
                      teamName={team.team}
                      logoUrl={team.logoUrl}
                      size="sm"
                      clickable={true}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{team.team}</div>
                      <div className="text-xs text-muted-foreground">Last 10: {team.last10}</div>
                    </div>
                    <Badge variant="default" className="bg-orange-500">{team.streak}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Risers */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Top Risers
              </h4>
              <div className="space-y-2">
                {topRisers.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <TeamWithLogo
                      teamName={team.team}
                      logoUrl={team.logoUrl}
                      size="sm"
                      clickable={true}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{team.team}</div>
                      <div className="text-xs text-muted-foreground">
                        {team.prevRate.toFixed(1)}% → {team.r69wRate.toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      +{team.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Fallers */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                Biggest Drops
              </h4>
              <div className="space-y-2">
                {topFallers.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <TeamWithLogo
                      teamName={team.team}
                      logoUrl={team.logoUrl}
                      size="sm"
                      clickable={true}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{team.team}</div>
                      <div className="text-xs text-muted-foreground">
                        {team.prevRate.toFixed(1)}% → {team.r69wRate.toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      {team.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Teams Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={topTeams.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="team" stroke="#888" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" stroke="#888" label={{ value: 'R69W Rate (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" label={{ value: 'Avg Margin', angle: 90, position: 'insideRight' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="r69wRate" name="R69W Rate (%)" fill="#10B981" stroke="#10B981" fillOpacity={0.3} />
              <Bar yAxisId="left" dataKey="r69Events" name="R69 Events" fill="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="avgMargin" name="Avg Margin" stroke="#FF6B35" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
