'use client'

export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target, Zap, Trophy, BarChart3 } from 'lucide-react'

// Mock data for charts
const r69WinRateData = [
  { conference: 'Big 12', winRate: 75.6, total: 45 },
  { conference: 'Big Ten', winRate: 73.8, total: 42 },
  { conference: 'SEC', winRate: 72.5, total: 40 },
  { conference: 'ACC', winRate: 71.1, total: 38 },
  { conference: 'Big East', winRate: 71.4, total: 28 },
  { conference: 'Other', winRate: 68.9, total: 52 },
]

const marginDistribution = [
  { range: '1-5 pts', wins: 28, losses: 12 },
  { range: '6-10 pts', wins: 42, losses: 8 },
  { range: '11-15 pts', wins: 38, losses: 4 },
  { range: '16-20 pts', wins: 24, losses: 2 },
  { range: '21+ pts', wins: 18, losses: 1 },
]

const timeToR69Data = [
  { period: 'P1 (0-5min)', events: 12, winRate: 83.3 },
  { period: 'P1 (5-10min)', events: 28, winRate: 78.6 },
  { period: 'P1 (10-15min)', events: 35, winRate: 74.3 },
  { period: 'P1 (15-20min)', events: 18, winRate: 72.2 },
  { period: 'P2 (0-10min)', events: 42, winRate: 71.4 },
  { period: 'P2 (10-20min)', events: 15, winRate: 66.7 },
]

const outcomeData = [
  { name: 'R69 Wins', value: 150, color: '#10B981' },
  { name: 'Premature 69', value: 38, color: '#EF4444' },
  { name: 'No R69 Event', value: 562, color: '#6B7280' },
]

const trendData = [
  { week: 'Week 1', r69Events: 12, r69Wins: 9, winRate: 75.0 },
  { week: 'Week 2', r69Events: 18, r69Wins: 14, winRate: 77.8 },
  { week: 'Week 3', r69Events: 22, r69Wins: 16, winRate: 72.7 },
  { week: 'Week 4', r69Events: 25, r69Wins: 19, winRate: 76.0 },
  { week: 'Week 5', r69Events: 28, r69Wins: 21, winRate: 75.0 },
]

const COLORS = ['#10B981', '#EF4444', '#6B7280']

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pb-6 border-b">
            <div className="inline-flex items-center gap-3 mb-2">
              <BarChart3 className="h-12 w-12 text-basketball-orange" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-basketball-orange to-court-green bg-clip-text text-transparent">
                Statistics Explorer
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep dive into the R69W phenomenon with comprehensive statistical analysis
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-r69w-success/10 to-r69w-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-r69w-success" />
                  Overall R69W Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-r69w-success">73.2%</div>
                <p className="text-xs text-muted-foreground mt-1">150 wins / 188 events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Total R69 Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">188</div>
                <p className="text-xs text-muted-foreground mt-1">This season</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Avg Time to 69
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-basketball-orange">9:34</div>
                <p className="text-xs text-muted-foreground mt-1">Game time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Avg Margin at 69
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+11.4</div>
                <p className="text-xs text-muted-foreground mt-1">Points</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Consecutive 100%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">5</div>
                <p className="text-xs text-muted-foreground mt-1">Seasons (Tennessee)</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="winrates" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4">
              <TabsTrigger value="winrates">Win Rates</TabsTrigger>
              <TabsTrigger value="margins">Margins</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            {/* Win Rates by Conference */}
            <TabsContent value="winrates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>R69W Win Rate by Conference</CardTitle>
                  <CardDescription>
                    Success rates when reaching 69 first across different conferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={r69WinRateData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="conference" className="text-xs" />
                      <YAxis domain={[0, 100]} label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }} className="text-xs" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null
                          const data = payload[0].payload
                          return (
                            <div className="bg-popover border rounded-lg shadow-lg p-3">
                              <p className="font-semibold">{data.conference}</p>
                              <p className="text-sm text-r69w-success">Win Rate: {data.winRate}%</p>
                              <p className="text-xs text-muted-foreground">Total Events: {data.total}</p>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="winRate" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Outcome Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Outcomes Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of all games by R69 event outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Margin Distribution */}
            <TabsContent value="margins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Win/Loss by Margin at 69</CardTitle>
                  <CardDescription>
                    How the lead size at 69 points affects final outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={marginDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="wins" fill="#10B981" name="Wins" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="losses" fill="#EF4444" name="Losses" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-r69w-success/10 to-r69w-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Target className="h-8 w-8 text-r69w-success flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Key Finding</h3>
                      <p className="text-sm text-muted-foreground">
                        Teams with a 11+ point lead when hitting 69 have an impressive 92% win rate,
                        while teams with a 1-5 point lead win only 70% of the time. The size of the
                        lead matters significantly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timing Analysis */}
            <TabsContent value="timing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Win Rate by Time to 69</CardTitle>
                  <CardDescription>
                    When teams reach 69 and how it affects their chances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeToR69Data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" className="text-xs" angle={-15} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" domain={[0, 100]} className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="winRate"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Win Rate (%)"
                        dot={{ fill: '#10B981', r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="events"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        name="# Events"
                        dot={{ fill: '#FF6B35', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-basketball-orange/10 to-basketball-orange/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Zap className="h-8 w-8 text-basketball-orange flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Speed Matters</h3>
                      <p className="text-sm text-muted-foreground">
                        Teams that reach 69 in the first 5 minutes have the highest win rate at 83.3%.
                        The earlier you hit 69, the better your chances of winning, with win rates
                        gradually declining as the game progresses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Over Time */}
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>R69 Events & Win Rate Trends</CardTitle>
                  <CardDescription>
                    Weekly trends throughout the season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="r69Events"
                        stroke="#FF6B35"
                        strokeWidth={3}
                        name="R69 Events"
                        dot={{ fill: '#FF6B35', r: 5 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="r69Wins"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="R69 Wins"
                        dot={{ fill: '#10B981', r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="winRate"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Win Rate (%)"
                        dot={{ fill: '#3B82F6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-court-green/10 to-court-green/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-8 w-8 text-court-green flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Consistency</h3>
                      <p className="text-sm text-muted-foreground">
                        The R69W win rate has remained remarkably consistent throughout the season,
                        hovering between 72-78%. This consistency validates the phenomenon and
                        suggests it's a reliable indicator of game outcomes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Trophy className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Perfect Streak</h3>
                      <p className="text-sm text-muted-foreground">
                        Tennessee Volunteers holds the record for most consecutive seasons with 100% R69W rate at 5 seasons
                        (2021-22 through 2025-26), going 132-0 in R69 events during this span. Kansas follows with 4 consecutive perfect seasons.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
