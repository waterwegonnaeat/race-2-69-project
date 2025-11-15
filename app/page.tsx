'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TeamSearch } from '@/components/TeamSearch'
import { TeamGamesTimeline } from '@/components/TeamGamesTimeline'
import { DashboardStats } from '@/components/DashboardStats'
import { LeaderboardDashboard } from '@/components/LeaderboardDashboard'
import { BouncingBasketball } from '@/components/BouncingBasketball'
import { TeamLogo } from '@/components/TeamLogo'
import { useTeamGames } from '@/hooks/useTeamGames'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trophy, Target, BarChart3, TrendingUp, TrendingDown, Sparkles, ChevronDown, Activity, Users,
  Calendar, Filter, Home, Plane, Award, Timer, Zap, Menu, X
} from 'lucide-react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedTeam, setSelectedTeam] = useState<string | null>('Arkansas Razorbacks')
  const [selectedTeamLogo, setSelectedTeamLogo] = useState<string | null>(null)
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['2024-25'])
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  // Team Analytics Filters
  const [venue, setVenue] = useState<string>('all')
  const [gameType, setGameType] = useState<string>('all')
  const [result, setResult] = useState<string>('all')
  const [r69Status, setR69Status] = useState<string>('all')
  const [seasonFilter, setSeasonFilter] = useState<string>('2024-25')

  // Fetch available seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons')
        const data = await response.json()
        const seasons = data.seasons || []
        setAvailableSeasons(seasons)

        // Set selectedSeasons to current season only
        const currentSeason = '2024-25'
        if (seasons.includes(currentSeason)) {
          setSelectedSeasons([currentSeason])
        } else if (seasons.length > 0) {
          // If current season not found, use the most recent season (first in the list)
          setSeasonFilter(seasons[0])
          setSelectedSeasons([seasons[0]])
        }
      } catch (error) {
        console.error('Error fetching seasons:', error)
      }
    }
    fetchSeasons()
  }, [])

  // Update selectedSeasons when seasonFilter changes
  useEffect(() => {
    if (seasonFilter === 'all') {
      setSelectedSeasons(availableSeasons)
    } else {
      setSelectedSeasons([seasonFilter])
    }
  }, [seasonFilter, availableSeasons])

  // Handle URL parameters for team selection and filters
  useEffect(() => {
    const teamParam = searchParams?.get('team')
    const venueParam = searchParams?.get('venue')
    const gameTypeParam = searchParams?.get('gameType')
    const resultParam = searchParams?.get('result')
    const r69StatusParam = searchParams?.get('r69Status')
    const seasonParam = searchParams?.get('season')

    if (teamParam) {
      setSelectedTeam(decodeURIComponent(teamParam))
    }
    if (venueParam) {
      setVenue(venueParam)
    }
    if (gameTypeParam) {
      setGameType(gameTypeParam)
    }
    if (resultParam) {
      setResult(resultParam)
    }
    if (r69StatusParam) {
      setR69Status(r69StatusParam)
    }
    if (seasonParam) {
      setSeasonFilter(seasonParam)
    }
  }, [searchParams])

  // Sync filters to URL when they change
  useEffect(() => {
    if (!selectedTeam) return

    const params = new URLSearchParams()
    params.set('team', selectedTeam)
    if (venue !== 'all') params.set('venue', venue)
    if (gameType !== 'all') params.set('gameType', gameType)
    if (result !== 'all') params.set('result', result)
    if (r69Status !== 'all') params.set('r69Status', r69Status)
    if (seasonFilter !== 'all') params.set('season', seasonFilter)

    router.push(`?${params.toString()}`, { scroll: false })
  }, [selectedTeam, venue, gameType, result, r69Status, seasonFilter, router])


  // Fetch team games
  const { data, isLoading, error } = useTeamGames({
    teamName: selectedTeam,
    seasons: selectedSeasons,
    enabled: !!selectedTeam,
  })

  // Extract team logo from games data
  useEffect(() => {
    if (data?.games && data.games.length > 0 && selectedTeam) {
      const firstGame = data.games[0]
      const isHome = firstGame.homeTeamName === selectedTeam
      const logo = isHome ? firstGame.homeTeamLogo : firstGame.awayTeamLogo
      setSelectedTeamLogo(logo)
    } else {
      setSelectedTeamLogo(null)
    }
  }, [data, selectedTeam])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f0a] via-[#2a1810] to-[#3a2418]">
      {/* Floating Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-basketball-orange" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-basketball-orange bg-clip-text text-transparent">
              Race to 69
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('overview')}
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => scrollToSection('leaderboards')}
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Leaderboards
            </button>
            <button
              onClick={() => scrollToSection('statistics')}
              className="text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Statistics
            </button>
            <a
              href="/stats/premature-69"
              className="text-white/80 hover:text-red-500 transition-colors font-medium flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Hall of Shame
            </a>
            <button
              onClick={() => scrollToSection('team-analysis')}
              className="px-4 py-2 bg-gradient-to-r from-basketball-orange to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-basketball-orange/30 transition-all"
            >
              Team Analysis
            </button>
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
              <button
                onClick={() => scrollToSection('overview')}
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <Sparkles className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => scrollToSection('leaderboards')}
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <Trophy className="h-4 w-4" />
                Leaderboards
              </button>
              <button
                onClick={() => scrollToSection('statistics')}
                className="w-full text-left text-white/80 hover:text-basketball-orange transition-colors font-medium flex items-center gap-2 py-2"
              >
                <BarChart3 className="h-4 w-4" />
                Statistics
              </button>
              <a
                href="/stats/premature-69"
                className="w-full text-left text-white/80 hover:text-red-500 transition-colors font-medium flex items-center gap-2 py-2"
              >
                <TrendingDown className="h-4 w-4" />
                Hall of Shame
              </a>
              <button
                onClick={() => scrollToSection('team-analysis')}
                className="w-full text-left px-4 py-2 bg-gradient-to-r from-basketball-orange to-orange-600 text-white rounded-lg font-semibold"
              >
                Team Analysis
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Team Analysis Section - Main Focus */}
      <section id="team-analysis" className="relative bg-gradient-to-b from-[#1a0f0a] via-[#2a1810] to-[#1a0f0a] pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              {selectedTeam && selectedTeamLogo ? (
                <TeamLogo
                  teamName={selectedTeam}
                  logoUrl={selectedTeamLogo}
                  size="xl"
                  clickable={false}
                  className="bg-white rounded-full p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-basketball-orange via-warm-orange to-sunshine-yellow flex items-center justify-center shadow-2xl">
                  <Target className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              )}
              <h2 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-sunrise-glow via-sunshine-yellow to-warm-orange bg-clip-text text-transparent">
                  Team Analysis
                </span>
              </h2>
            </div>
            <p className="text-lg text-sunrise-glow/70 max-w-2xl mx-auto">
              Deep dive into any team's performance in the Race to 69
            </p>
          </div>

          <div className="space-y-6 overflow-visible">
              {/* Unified Team Selection & Filter Panel */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-visible shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white text-xl">
                        <Users className="h-5 w-5 text-basketball-orange" />
                        Team Selection & Filters
                      </CardTitle>
                      <CardDescription className="text-white/60 mt-1">
                        Search for a team and refine your analysis
                      </CardDescription>
                    </div>
                    {selectedTeam && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam('Arkansas Razorbacks')
                          setSelectedTeamLogo(null)
                          setSeasonFilter('2024-25')
                          setVenue('all')
                          setGameType('all')
                          setResult('all')
                          setR69Status('all')
                        }}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-basketball-orange/50 transition-all"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 overflow-visible space-y-6">
                  {/* Selected Team Display */}
                  {selectedTeam && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-basketball-orange/20 to-warm-orange/10 rounded-lg border border-basketball-orange/30">
                      <TeamLogo
                        teamName={selectedTeam}
                        logoUrl={selectedTeamLogo}
                        size="lg"
                        clickable={false}
                        className="bg-white rounded-full p-1"
                      />
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">{selectedTeam}</div>
                        <div className="text-white/60 text-sm">
                          {selectedSeasons.length > 0 ? selectedSeasons.join(', ') : 'All Seasons'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Search */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">
                      Search Team
                    </label>
                    <TeamSearch
                      onTeamSelect={(team) => {
                        console.log('Team selected:', team)
                        setSelectedTeam(team)
                      }}
                      selectedTeam={selectedTeam}
                    />
                  </div>

                  {/* Compact Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Season Filter - Compact */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/70 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Season
                      </label>
                      <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Seasons</SelectItem>
                          {availableSeasons.map((season) => (
                            <SelectItem key={season} value={season}>
                              {season}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Venue Filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/70 flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        Venue
                      </label>
                      <Select value={venue} onValueChange={setVenue}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Game Type Filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/70 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" />
                        Type
                      </label>
                      <Select value={gameType} onValueChange={setGameType}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Result Filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/70 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        Result
                      </label>
                      <Select value={result} onValueChange={setResult}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="wins">Wins</SelectItem>
                          <SelectItem value="losses">Losses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* R69 Status Filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/70 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        R69 Status
                      </label>
                      <Select value={r69Status} onValueChange={setR69Status}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="r69_only">R69 Only</SelectItem>
                          <SelectItem value="no_r69">No R69</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Results */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 relative z-10">
                <CardContent className="p-0">
                  {!selectedTeam ? (
                    <div className="text-center py-24 px-4">
                      <div className="relative inline-flex mb-8">
                        <div className="absolute inset-0 animate-ping opacity-30">
                          <div className="w-24 h-24 rounded-full bg-basketball-orange/40" />
                        </div>
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-basketball-orange via-warm-orange to-sunshine-yellow flex items-center justify-center shadow-2xl">
                          <Target className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold mb-4 text-white">Get Started</h3>
                      <p className="text-white/60 max-w-lg mx-auto mb-6 text-lg">
                        Select a team above to explore their complete R69W performance analytics,
                        game-by-game breakdowns, and historical trends
                      </p>
                      <div className="flex items-center justify-center gap-6 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>Real-time Stats</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Trend Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Visual Charts</span>
                        </div>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="py-24">
                      <BouncingBasketball />
                      <p className="text-center text-white/60 mt-6 text-lg">Loading {selectedTeam} analytics...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-20">
                      <div className="text-red-400 text-lg mb-2">Error loading team data</div>
                      <p className="text-white/60">Please try selecting a different team</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <TeamGamesTimeline
                        teamName={selectedTeam}
                        games={data?.games || []}
                        initialFilters={{
                          gameType,
                          venue,
                          result,
                          r69Status
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      {/* Fun Insights Section */}
      <section id="fun-facts" className="relative py-20 bg-gradient-to-b from-[#2a1810] to-[#1a0f0a] border-t border-white/10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12">
            <span className="bg-gradient-to-r from-sunrise-glow via-sunshine-yellow to-warm-orange bg-clip-text text-transparent">
              Did You Know?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-xl border-basketball-orange/30 hover:border-basketball-orange/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-basketball-orange to-warm-orange flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">72.3%</h3>
                <p className="text-sunrise-glow/80">
                  Teams that hit 69 first win the game (R69W Rate)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-sunshine-yellow/30 hover:border-sunshine-yellow/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sunshine-yellow to-warm-orange flex items-center justify-center">
                  <Timer className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">28.5 min</h3>
                <p className="text-sunrise-glow/80">
                  Average time to reach 69 points in a game
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-sunset-peach/30 hover:border-sunset-peach/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sunset-peach to-warm-orange flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">62.8%</h3>
                <p className="text-sunrise-glow/80">
                  Of games have at least one team reach 69 points
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="relative bg-gradient-to-b from-[#2a1810] to-[#1a0f0a] py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-sunrise-glow via-sunshine-yellow to-warm-orange bg-clip-text text-transparent">
                Overview
              </span>
            </h2>
            <p className="text-lg text-sunrise-glow/70 max-w-2xl mx-auto">
              Comprehensive statistics and insights from the Race to 69
            </p>
          </div>
          <DashboardStats />
        </div>
      </section>

      {/* Leaderboards Section */}
      <section id="leaderboards" className="relative bg-gradient-to-b from-[#1a0f0a] to-[#2a1810] py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-sunrise-glow via-sunshine-yellow to-warm-orange bg-clip-text text-transparent">
                Leaderboards
              </span>
            </h2>
            <p className="text-lg text-sunrise-glow/70 max-w-2xl mx-auto">
              Top performers in the Race to 69 phenomenon
            </p>
          </div>
          <LeaderboardDashboard />
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="relative bg-gradient-to-b from-[#2a1810] to-[#1a0f0a] py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-sunrise-glow via-sunshine-yellow to-warm-orange bg-clip-text text-transparent">
                Advanced Statistics
              </span>
            </h2>
            <p className="text-lg text-sunrise-glow/70 max-w-2xl mx-auto">
              Deep statistical analysis of the R69W phenomenon
            </p>
          </div>
          <DashboardStats />
        </div>
      </section>

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

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
