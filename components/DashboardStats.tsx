'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, Target, Zap, BarChart3, Users } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface DashboardStatsProps {
  data?: any
}

// Mock comprehensive stats data
const r69SuccessRateData = [
  { name: 'R69W', value: 73, fill: '#10B981' },
  { name: 'R69L', value: 27, fill: '#EF4444' },
]

const marginDistribution = [
  { margin: '1-5', r69w: 45, r69l: 35, total: 80 },
  { margin: '6-10', r69w: 78, r69l: 22, total: 100 },
  { margin: '11-15', r69w: 92, r69l: 8, total: 100 },
  { margin: '16-20', r69w: 96, r69l: 4, total: 100 },
  { margin: '21+', r69w: 98, r69l: 2, total: 100 },
]

const periodBreakdown = [
  { period: '1st Half', r69Events: 234, r69wRate: 71.2 },
  { period: '2nd Half', r69Events: 678, r69wRate: 73.8 },
  { period: 'OT', r69Events: 12, r69wRate: 66.7 },
]

const conferenceComparison = [
  { conference: 'Big 12', r69Events: 145, r69wRate: 75.2, avgMargin: 12.3 },
  { conference: 'SEC', r69Events: 142, r69wRate: 72.5, avgMargin: 11.8 },
  { conference: 'Big Ten', r69Events: 138, r69wRate: 73.9, avgMargin: 12.1 },
  { conference: 'ACC', r69Events: 125, r69wRate: 71.2, avgMargin: 10.9 },
  { conference: 'Big East', r69Events: 98, r69wRate: 74.5, avgMargin: 11.5 },
]

const timeToR69 = [
  { time: '0-10 min', count: 45, r69wRate: 78.2 },
  { time: '10-20 min', count: 156, r69wRate: 75.6 },
  { time: '20-30 min', count: 298, r69wRate: 73.1 },
  { time: '30-40 min', count: 234, r69wRate: 71.8 },
]

const homeAwayComparison = [
  { type: 'Home', r69Events: 478, r69wRate: 76.8, avgMargin: 13.2 },
  { type: 'Away', r69Events: 456, r69wRate: 69.5, avgMargin: 10.4 },
]

const seasonTrends = [
  { season: '19-20', r69Events: 2845, r69wRate: 71.8 },
  { season: '20-21', r69Events: 2156, r69wRate: 72.3 },
  { season: '21-22', r69Events: 2934, r69wRate: 72.9 },
  { season: '22-23', r69Events: 3012, r69wRate: 73.2 },
  { season: '23-24', r69Events: 3087, r69wRate: 73.5 },
  { season: '24-25', r69Events: 856, r69wRate: 73.1 },
]

const teamPerformanceMetrics = [
  { metric: 'R69W Rate', value: 73 },
  { metric: 'Avg Margin', value: 75 },
  { metric: 'Home Advantage', value: 82 },
  { metric: 'Conference Dominance', value: 68 },
  { metric: 'Consistency', value: 71 },
]

const COLORS = {
  primary: '#FF6B35',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#A855F7',
}

export function DashboardStats({ data }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-basketball-orange/10 to-basketball-orange/5 border-basketball-orange/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-basketball-orange" />
              Total R69 Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-basketball-orange">15,890</div>
            <p className="text-xs text-muted-foreground mt-1">Across all seasons</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              R69W Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">73.2%</div>
            <p className="text-xs text-muted-foreground mt-1">11,632 wins out of 15,890</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Avg Margin at 69
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">+11.8</div>
            <p className="text-xs text-muted-foreground mt-1">Points ahead when hitting 69</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Teams Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">358</div>
            <p className="text-xs text-muted-foreground mt-1">Division I programs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
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

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* R69 Success Rate Pie */}
        <Card>
          <CardHeader>
            <CardTitle>R69 Success Rate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={r69SuccessRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {r69SuccessRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Teams hitting 69 first win nearly 3 out of 4 games
            </div>
          </CardContent>
        </Card>

        {/* Margin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rate by Margin at 69</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marginDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="margin" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="r69w" name="R69 Wins" fill={COLORS.success} />
                <Bar dataKey="r69l" name="R69 Losses" fill={COLORS.danger} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Win rate increases dramatically when ahead at 69, but still significant when trailing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conference Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Conference R69W Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conferenceComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis type="category" dataKey="conference" stroke="#888" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="r69wRate" name="R69W Rate (%)" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Season Trends */}
        <Card>
          <CardHeader>
            <CardTitle>R69W Rate Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={seasonTrends}>
                <defs>
                  <linearGradient id="colorR69" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="season" stroke="#888" />
                <YAxis stroke="#888" domain={[70, 75]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="r69wRate"
                  name="R69W Rate (%)"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorR69)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              R69W phenomenon remains consistent across seasons (~73%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>R69 Events by Period</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={periodBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="period" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Bar dataKey="r69Events" name="R69 Events" fill={COLORS.info} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Home vs Away */}
        <Card>
          <CardHeader>
            <CardTitle>Home vs Away R69W Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={homeAwayComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="type" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Bar dataKey="r69wRate" name="R69W Rate (%)" fill={COLORS.warning} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Home teams show stronger R69W performance
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={teamPerformanceMetrics}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="metric" stroke="#888" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#888" />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke={COLORS.purple}
                  fill={COLORS.purple}
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time to R69 Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>R69W Rate by Game Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeToR69}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis yAxisId="left" stroke="#888" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" domain={[65, 80]} label={{ value: 'R69W Rate (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" name="R69 Events" stroke={COLORS.info} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="r69wRate" name="R69W Rate (%)" stroke={COLORS.success} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Earlier R69 events show slightly higher win rates
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-basketball-orange/5 to-transparent border-basketball-orange/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-basketball-orange" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="font-semibold text-green-500 mb-1">73.2% Win Rate</div>
              <p className="text-sm text-muted-foreground">
                Teams hitting 69 first win nearly 3 out of every 4 games
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="font-semibold text-blue-500 mb-1">+11.8 Avg Margin</div>
              <p className="text-sm text-muted-foreground">
                Average margin when reaching 69 first (positive = ahead, negative = behind)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="font-semibold text-purple-500 mb-1">76.8% at Home</div>
              <p className="text-sm text-muted-foreground">
                Home teams show significantly better R69W performance than away teams
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="font-semibold text-yellow-500 mb-1">Big 12 Leads</div>
              <p className="text-sm text-muted-foreground">
                Big 12 conference shows highest R69W rate at 75.2%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="font-semibold text-red-500 mb-1">Margin Matters</div>
              <p className="text-sm text-muted-foreground">
                Teams leading by 11+ at 69 points win 92% of the time
              </p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="font-semibold text-indigo-500 mb-1">Consistent Trend</div>
              <p className="text-sm text-muted-foreground">
                R69W rate has remained stable at ~73% across multiple seasons
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="font-semibold text-yellow-500 mb-1">5 Perfect Seasons</div>
              <p className="text-sm text-muted-foreground">
                Tennessee Volunteers achieved 100% R69W rate for 5 consecutive seasons (2021-26)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
