'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ScoringEvent {
  timestamp: number // seconds elapsed in game
  period: number
  clock: string
  homeScore: number
  awayScore: number
  scoringTeam?: 'home' | 'away'
  description?: string
}

interface ScoringWormChartProps {
  events: ScoringEvent[]
  homeTeamName: string
  awayTeamName: string
  homeColor?: string
  awayColor?: string
  highlightR69?: boolean
  r69Event?: {
    teamId: string
    timestamp: number
    isHomeTeam: boolean
  }
  className?: string
}

export function ScoringWormChart({
  events,
  homeTeamName,
  awayTeamName,
  homeColor = '#FF6B35',
  awayColor = '#004E89',
  highlightR69 = false,
  r69Event,
  className,
}: ScoringWormChartProps) {
  // Process events for chart data
  const chartData = useMemo(() => {
    if (!events || events.length === 0) return []

    // Add starting point at 0-0
    const data = [
      {
        timestamp: 0,
        clock: '20:00',
        period: 1,
        homeScore: 0,
        awayScore: 0,
        margin: 0,
      },
      ...events.map(event => ({
        timestamp: event.timestamp,
        clock: event.clock,
        period: event.period,
        homeScore: event.homeScore,
        awayScore: event.awayScore,
        margin: event.homeScore - event.awayScore,
        scoringTeam: event.scoringTeam,
        description: event.description,
      })),
    ]

    return data
  }, [events])

  // Find R69 point if applicable
  const r69Point = useMemo(() => {
    if (!highlightR69 || !r69Event) return null
    return chartData.find(d => d.timestamp === r69Event.timestamp)
  }, [chartData, highlightR69, r69Event])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    const leader = data.homeScore > data.awayScore ? homeTeamName :
                   data.awayScore > data.homeScore ? awayTeamName :
                   'Tied'
    const margin = Math.abs(data.margin)

    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 space-y-2">
        <div className="font-semibold text-sm">
          Period {data.period} - {data.clock}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: homeColor }}
            />
            <span className="text-sm">{homeTeamName}: {data.homeScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: awayColor }}
            />
            <span className="text-sm">{awayTeamName}: {data.awayScore}</span>
          </div>
        </div>
        {leader !== 'Tied' && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {leader} leads by {margin}
          </div>
        )}
        {data.description && (
          <div className="text-xs text-muted-foreground pt-1 border-t max-w-[200px]">
            {data.description}
          </div>
        )}
        {r69Point && data.timestamp === r69Point.timestamp && (
          <div className="text-xs font-bold text-r69w-success pt-1 border-t">
            🎯 R69 Event!
          </div>
        )}
      </div>
    )
  }

  // Format X-axis (time)
  const formatXAxis = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60)
    return `${minutes}'`
  }

  // Calculate Y-axis domain with padding
  const maxScore = useMemo(() => {
    if (chartData.length === 0) return 100
    const max = Math.max(...chartData.map(d => Math.max(d.homeScore, d.awayScore)))
    return Math.ceil(max / 10) * 10 + 10
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Scoring Progression</CardTitle>
          <CardDescription>No scoring data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Scoring Progression</CardTitle>
        <CardDescription>
          Live scoring trends throughout the game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={homeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={homeColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={awayColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={awayColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              label={{ value: 'Game Time (minutes)', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis
              domain={[0, maxScore]}
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* The magic 69 line */}
            {highlightR69 && (
              <ReferenceLine
                y={69}
                stroke="#10B981"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'R69',
                  position: 'right',
                  fill: '#10B981',
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* R69 event marker */}
            {r69Point && (
              <ReferenceLine
                x={r69Point.timestamp}
                stroke="#10B981"
                strokeDasharray="3 3"
                label={{
                  value: '🎯',
                  position: 'top',
                }}
              />
            )}

            {/* Home team line */}
            <Line
              type="monotone"
              dataKey="homeScore"
              stroke={homeColor}
              strokeWidth={3}
              dot={{ fill: homeColor, r: 3 }}
              activeDot={{ r: 6 }}
              name={homeTeamName}
            />

            {/* Away team line */}
            <Line
              type="monotone"
              dataKey="awayScore"
              stroke={awayColor}
              strokeWidth={3}
              dot={{ fill: awayColor, r: 3 }}
              activeDot={{ r: 6 }}
              name={awayTeamName}
            />

            {/* Area fills for visual emphasis */}
            <Area
              type="monotone"
              dataKey="homeScore"
              fill="url(#homeGradient)"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="awayScore"
              fill="url(#awayGradient)"
              stroke="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
