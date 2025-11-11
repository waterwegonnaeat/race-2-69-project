'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon,
  Activity, Download, Maximize2
} from 'lucide-react'

interface InteractiveChartProps {
  title: string
  type: 'line' | 'bar' | 'area' | 'pie'
  data: any[]
  className?: string
}

export function InteractiveChart({
  title,
  type,
  data,
  className = ''
}: InteractiveChartProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Sample data if none provided
  const chartData = data.length > 0 ? data : generateSampleData(type)

  const colors = {
    primary: '#f97316',   // orange-500
    secondary: '#3b82f6', // blue-500
    success: '#10b981',   // green-500
    warning: '#f59e0b',   // amber-500
    danger: '#ef4444',    // red-500
    purple: '#8b5cf6',    // purple-500
  }

  const pieColors = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.purple,
    colors.danger,
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#fff' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6, fill: colors.primary }}
              />
              {chartData[0]?.value2 !== undefined && (
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke={colors.secondary}
                  strokeWidth={3}
                  dot={{ fill: colors.secondary, r: 4 }}
                  activeDot={{ r: 6, fill: colors.secondary }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#fff' }}
                iconType="circle"
              />
              <Bar
                dataKey="value"
                fill={colors.primary}
                radius={[8, 8, 0, 0]}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#fff' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'line':
        return TrendingUp
      case 'bar':
        return BarChart3
      case 'area':
        return Activity
      case 'pie':
        return PieChartIcon
      default:
        return BarChart3
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-500/30 transition-all overflow-hidden">
        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 opacity-0 pointer-events-none"
          animate={{ opacity: isHovered ? 0.05 : 0 }}
        />

        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              {title}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/20 text-slate-400">
                {chartData.length} points
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {renderChart()}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function generateSampleData(type: string) {
  if (type === 'pie') {
    return [
      { name: 'R69 & Won', value: 732 },
      { name: 'R69 & Lost', value: 268 },
      { name: 'No R69 & Won', value: 450 },
      { name: 'No R69 & Lost', value: 550 },
    ]
  }

  return Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(Math.random() * 100) + 50,
    value2: Math.floor(Math.random() * 80) + 40,
  }))
}
