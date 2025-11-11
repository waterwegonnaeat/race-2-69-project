'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamSearch } from '@/components/TeamSearch'
import { SeasonSelector } from '@/components/SeasonSelector'
import { TeamGamesTimeline } from '@/components/TeamGamesTimeline'
import { DashboardStats } from '@/components/DashboardStats'
import { LeaderboardDashboard } from '@/components/LeaderboardDashboard'
import { BouncingBasketball } from '@/components/BouncingBasketball'
import { useTeamGames } from '@/hooks/useTeamGames'
import {
  LayoutDashboard, Trophy, Target, BarChart3, Users, TrendingUp,
  Sparkles, Activity, Calendar
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['2024-25'])
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch team games
  const { data, isLoading, error } = useTeamGames({
    teamName: selectedTeam,
    seasons: selectedSeasons,
    enabled: !!selectedTeam,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-basketball-orange/10 border border-basketball-orange/20">
              <LayoutDashboard className="h-8 w-8 text-basketball-orange" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-basketball-orange via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                R69W Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive NCAA Basketball R69 (Race to 69) Statistics & Insights
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-basketball-orange/20 bg-gradient-to-br from-basketball-orange/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-basketball-orange" />
                  <div>
                    <div className="text-2xl font-bold">15,890</div>
                    <div className="text-xs text-muted-foreground">Total R69 Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">73.2%</div>
                    <div className="text-xs text-muted-foreground">R69W Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">358</div>
                    <div className="text-xs text-muted-foreground">Teams Tracked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">+11.8</div>
                    <div className="text-xs text-muted-foreground">Avg Margin at 69</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[800px] bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-basketball-orange data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2 data-[state=active]:bg-basketball-orange data-[state=active]:text-white">
              <Trophy className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2 data-[state=active]:bg-basketball-orange data-[state=active]:text-white">
              <Target className="h-4 w-4" />
              Team Analysis
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-basketball-orange data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Welcome Card */}
              <Card className="border-basketball-orange/20 bg-gradient-to-br from-basketball-orange/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-basketball-orange" />
                    Welcome to R69W Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Discover the fascinating R69W phenomenon: teams that are the first to reach 69 points while
                    leading win approximately <span className="font-bold text-green-500">73% of their games</span>.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-basketball-orange mt-1.5" />
                      <p className="text-sm">
                        <span className="font-semibold">15,890+ R69 events</span> analyzed across multiple seasons
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-basketball-orange mt-1.5" />
                      <p className="text-sm">
                        <span className="font-semibold">358 Division I teams</span> tracked and ranked
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-basketball-orange mt-1.5" />
                      <p className="text-sm">
                        <span className="font-semibold">Real-time analytics</span> with comprehensive visualizations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setActiveTab('leaderboards')}
                    className="w-full p-4 rounded-lg border border-basketball-orange/20 bg-basketball-orange/5 hover:bg-basketball-orange/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-basketball-orange" />
                      <div>
                        <div className="font-semibold">View Leaderboards</div>
                        <div className="text-sm text-muted-foreground">Top teams and conferences</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('teams')}
                    className="w-full p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">Analyze a Team</div>
                        <div className="text-sm text-muted-foreground">Detailed team performance</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('stats')}
                    className="w-full p-4 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-semibold">Explore Statistics</div>
                        <div className="text-sm text-muted-foreground">Advanced analytics & trends</div>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Overview Stats */}
            <DashboardStats />
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards" className="space-y-6 mt-6">
            <LeaderboardDashboard />
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-basketball-orange" />
                  Team Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Search Team</label>
                    <TeamSearch
                      onTeamSelect={setSelectedTeam}
                      selectedTeam={selectedTeam}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Select Seasons
                    </label>
                    <SeasonSelector
                      selectedSeasons={selectedSeasons}
                      onSeasonsChange={setSelectedSeasons}
                    />
                  </div>
                </div>

                {/* Team Results */}
                {!selectedTeam ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Team to Begin</h3>
                    <p className="text-muted-foreground">
                      Search for any Division I team to view their R69W performance
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="py-12">
                    <BouncingBasketball />
                    <p className="text-center text-muted-foreground mt-4">Loading team data...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-destructive">
                    <p>Error loading team data</p>
                  </div>
                ) : (
                  <TeamGamesTimeline
                    teamName={selectedTeam}
                    games={data?.games || []}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6 mt-6">
            <Card className="border-basketball-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-basketball-orange" />
                  Advanced Statistics & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Comprehensive statistical analysis of the R69W phenomenon across NCAA Division I basketball
                </p>
                <DashboardStats />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
