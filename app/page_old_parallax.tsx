'use client'

import { useState, useEffect, useRef } from 'react'
import { TeamSearch } from '@/components/TeamSearch'
import { SeasonSelector } from '@/components/SeasonSelector'
import { TeamGamesTimeline } from '@/components/TeamGamesTimeline'
import { BouncingBasketball } from '@/components/BouncingBasketball'
import { useTeamGames } from '@/hooks/useTeamGames'
import { Trophy, Target, TrendingUp, ChevronDown, Search, BarChart3, Calendar, Medal, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Mock leaderboard data
const mockTeamLeaders = [
  { rank: 1, team: 'Houston Cougars', conference: 'Big 12', r69Events: 12, r69Wins: 10, winRate: 83.3 },
  { rank: 2, team: 'UConn Huskies', conference: 'Big East', r69Events: 11, r69Wins: 9, winRate: 81.8 },
  { rank: 3, team: 'Purdue Boilermakers', conference: 'Big Ten', r69Events: 10, r69Wins: 8, winRate: 80.0 },
  { rank: 4, team: 'Kansas Jayhawks', conference: 'Big 12', r69Events: 9, r69Wins: 7, winRate: 77.8 },
  { rank: 5, team: 'Duke Blue Devils', conference: 'ACC', r69Events: 7, r69Wins: 5, winRate: 71.4 },
]

const mockConferenceLeaders = [
  { rank: 1, conference: 'Big 12', r69Events: 45, r69Wins: 34, winRate: 75.6, teams: 14 },
  { rank: 2, conference: 'Big Ten', r69Events: 42, r69Wins: 31, winRate: 73.8, teams: 18 },
  { rank: 3, conference: 'SEC', r69Events: 40, r69Wins: 29, winRate: 72.5, teams: 16 },
]

const mock69ClubTeams = [
  { team: 'Villanova Wildcats', conference: 'Big East', r69Events: 8, r69Wins: 7, winRate: 87.5, tier: 'Platinum' },
  { team: 'Michigan Wolverines', conference: 'Big Ten', r69Events: 9, r69Wins: 7, winRate: 77.8, tier: 'Gold' },
  { team: 'Tennessee Volunteers', conference: 'SEC', r69Events: 10, r69Wins: 7, winRate: 70.0, tier: 'Silver' },
]

export default function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['2024-25'])
  const [scrollY, setScrollY] = useState(0)

  const leaderboardsRef = useRef<HTMLElement>(null)
  const teamsRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const clubRef = useRef<HTMLElement>(null)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch team games
  const { data, isLoading, error } = useTeamGames({
    teamName: selectedTeam,
    seasons: selectedSeasons,
    enabled: !!selectedTeam,
  })

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Quick Navigation */}
      <nav className="fixed top-20 right-8 z-40 hidden lg:block">
        <div className="glass-effect rounded-full p-3 space-y-2">
          <button
            onClick={() => scrollToSection(leaderboardsRef)}
            className="block w-10 h-10 rounded-full bg-basketball-orange/20 hover:bg-basketball-orange/40 transition-all flex items-center justify-center group"
            title="Leaderboards"
          >
            <Trophy className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => scrollToSection(teamsRef)}
            className="block w-10 h-10 rounded-full bg-basketball-orange/20 hover:bg-basketball-orange/40 transition-all flex items-center justify-center"
            title="Teams"
          >
            <Target className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => scrollToSection(statsRef)}
            className="block w-10 h-10 rounded-full bg-basketball-orange/20 hover:bg-basketball-orange/40 transition-all flex items-center justify-center"
            title="Stats"
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => scrollToSection(clubRef)}
            className="block w-10 h-10 rounded-full bg-basketball-orange/20 hover:bg-basketball-orange/40 transition-all flex items-center justify-center"
            title="69 Club"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </button>
        </div>
      </nav>

      {/* SECTION 1: LEADERBOARDS */}
      <section
        ref={leaderboardsRef}
        className="relative min-h-screen flex items-center justify-center court-pattern"
        style={{
          background: `linear-gradient(135deg,
            hsl(45, 90%, ${Math.max(30, 50 - scrollY * 0.01)}%),
            hsl(25, 95%, ${Math.max(35, 45 - scrollY * 0.01)}%),
            hsl(15, 90%, ${Math.max(25, 40 - scrollY * 0.01)}%)
          )`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-victory-gold/20 rounded-full blur-3xl floating" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-basketball-orange/20 rounded-full blur-3xl floating" style={{ animationDelay: '1s', transform: `translateY(${scrollY * 0.3}px)` }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center mb-12 fade-in">
            <Trophy className="h-20 w-20 text-victory-gold mx-auto mb-6" />
            <h1 className="text-7xl font-black text-white mb-4">Leaderboards</h1>
            <p className="text-2xl text-white/90">Top R69W Performers</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Team Leaders */}
            <Card className="glass-effect border-2 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-basketball-orange" />
                  Top Teams
                </CardTitle>
                <CardDescription className="text-white/70">Highest R69W win rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTeamLeaders.map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-8">{getRankMedal(leader.rank)}</span>
                      <div>
                        <div className="font-semibold text-white group-hover:text-basketball-orange transition-colors">
                          {leader.team}
                        </div>
                        <div className="text-xs text-white/60">{leader.conference}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-r69w-success">{leader.winRate}%</div>
                      <div className="text-xs text-white/60">{leader.r69Wins}/{leader.r69Events}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conference Leaders */}
            <Card className="glass-effect border-2 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-court-green" />
                  Top Conferences
                </CardTitle>
                <CardDescription className="text-white/70">Best conference performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockConferenceLeaders.map((leader) => (
                  <div
                    key={leader.rank}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-8">{getRankMedal(leader.rank)}</span>
                      <div>
                        <div className="font-semibold text-white">{leader.conference}</div>
                        <div className="text-xs text-white/60">{leader.teams} teams</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-court-green">{leader.winRate}%</div>
                      <div className="text-xs text-white/60">{leader.r69Wins}/{leader.r69Events}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <button
            onClick={() => scrollToSection(teamsRef)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <ChevronDown className="h-10 w-10 text-white" />
          </button>
        </div>
      </section>

      {/* SECTION 2: TEAMS */}
      <section
        ref={teamsRef}
        className="relative min-h-screen flex items-center justify-center court-pattern"
        style={{
          background: `linear-gradient(135deg,
            hsl(222.2, 84%, ${Math.max(5, 15 - (scrollY - 800) * 0.01)}%),
            hsl(25, 95%, ${Math.max(40, 50 - (scrollY - 800) * 0.01)}%),
            hsl(145, 63%, ${Math.max(20, 35 - (scrollY - 800) * 0.01)}%)
          )`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-basketball-orange/10 rounded-full blur-3xl floating" style={{ transform: `translateY(${(scrollY - 800) * 0.3}px)` }} />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-court-green/10 rounded-full blur-3xl floating" style={{ animationDelay: '1s', transform: `translateY(${(scrollY - 800) * 0.5}px)` }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-12 py-20">
          <div className="space-y-6 fade-in">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-basketball-orange/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-32 h-32 rounded-full basketball-gradient flex items-center justify-center shadow-2xl glow-orange">
                  <span className="text-6xl font-black text-white drop-shadow-lg">69</span>
                </div>
              </div>
            </div>

            <h1 className="text-7xl md:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-basketball-orange via-victory-gold to-court-green bg-clip-text text-transparent drop-shadow-2xl">
                Team Analytics
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed">
              Track team performance in the{' '}
              <span className="text-basketball-orange font-bold">Race to 69</span> phenomenon.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 scale-in">
            <div className="glass-effect rounded-2xl p-8 shadow-2xl border-2 border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Search className="h-6 w-6 text-basketball-orange" />
                <h2 className="text-2xl font-bold text-white">Select a Team</h2>
              </div>

              <div className="space-y-4">
                <TeamSearch
                  onTeamSelect={setSelectedTeam}
                  selectedTeam={selectedTeam}
                />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white/70" />
                  <SeasonSelector
                    selectedSeasons={selectedSeasons}
                    onSeasonsChange={setSelectedSeasons}
                  />
                </div>
              </div>

              {selectedTeam && (
                <Button
                  onClick={() => scrollToSection(statsRef)}
                  className="mt-6 w-full bg-basketball-orange hover:bg-basketball-orange/90 text-white font-bold py-6 text-lg shadow-lg glow-orange"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View {selectedTeam} Statistics
                </Button>
              )}
            </div>
          </div>

          {selectedTeam && (
            <button
              onClick={() => scrollToSection(statsRef)}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
            >
              <ChevronDown className="h-10 w-10 text-white" />
            </button>
          )}
        </div>
      </section>

      {/* SECTION 3: STATS (Team Timeline) */}
      {selectedTeam && (
        <section
          ref={statsRef}
          className="relative min-h-screen py-20"
          style={{
            background: `linear-gradient(180deg,
              hsl(222.2, 84%, ${Math.max(5, 10 - (scrollY - 1600) * 0.005)}%),
              hsl(222.2, 84%, ${Math.max(3, 5 - (scrollY - 1600) * 0.005)}%)
            )`,
          }}
        >
          <div className="absolute inset-0 court-pattern opacity-30" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-40 left-10 w-64 h-64 bg-basketball-orange/5 rounded-full blur-3xl" style={{ transform: `translateY(${(scrollY - 1600) * 0.2}px)` }} />
            <div className="absolute bottom-40 right-10 w-80 h-80 bg-court-green/5 rounded-full blur-3xl" style={{ transform: `translateY(${(scrollY - 1600) * 0.3}px)` }} />
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <div className="text-center mb-12 slide-in-bottom">
              <div className="inline-flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full basketball-gradient flex items-center justify-center shadow-xl glow-orange">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-5xl md:text-6xl font-black text-white mb-2">{selectedTeam}</h2>
                  <div className="text-white/70 text-lg">
                    {selectedSeasons.join(', ')} Season{selectedSeasons.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center">
                <Card className="p-8 glass-effect border-2 border-white/10">
                  <BouncingBasketball />
                </Card>
              </div>
            )}

            {error && (
              <Card className="p-8 text-center glass-effect border-2 border-premature69-fail/30">
                <Target className="h-16 w-16 mx-auto text-premature69-fail mb-4" />
                <p className="text-white text-lg font-medium">Failed to load team data</p>
                <p className="text-white/60 mt-2">Please try selecting the team again</p>
              </Card>
            )}

            {!isLoading && !error && data?.games && (
              <div className="scale-in">
                <TeamGamesTimeline games={data.games} teamName={selectedTeam} />
              </div>
            )}

            <button
              onClick={() => scrollToSection(clubRef)}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
            >
              <ChevronDown className="h-10 w-10 text-white" />
            </button>
          </div>
        </section>
      )}

      {/* SECTION 4: 69 CLUB */}
      <section
        ref={clubRef}
        className="relative min-h-screen flex items-center justify-center py-20"
        style={{
          background: `linear-gradient(180deg,
            hsl(222.2, 84%, 4%),
            hsl(270, 50%, 10%),
            hsl(222.2, 84%, 4%)
          )`,
        }}
      >
        <div className="absolute inset-0 court-pattern opacity-20" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-victory-gold/10 rounded-full blur-3xl floating" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-basketball-orange/10 rounded-full blur-3xl floating" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16 fade-in">
            <Sparkles className="h-20 w-20 text-victory-gold mx-auto mb-6" />
            <h1 className="text-7xl font-black text-white mb-4">The 69 Club</h1>
            <p className="text-2xl text-white/80">Elite teams with exceptional R69W performance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mock69ClubTeams.map((team, idx) => (
              <Card
                key={idx}
                className="glass-effect border-2 hover:scale-105 transition-all"
                style={{
                  borderColor: team.tier === 'Platinum' ? '#E5E4E2' : team.tier === 'Gold' ? '#FFD700' : '#C0C0C0',
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className={
                        team.tier === 'Platinum'
                          ? 'bg-gray-200 text-gray-900'
                          : team.tier === 'Gold'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-400 text-white'
                      }
                    >
                      {team.tier}
                    </Badge>
                    <Trophy className="h-6 w-6 text-victory-gold" />
                  </div>
                  <CardTitle className="text-white">{team.team}</CardTitle>
                  <CardDescription className="text-white/60">{team.conference}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Win Rate</span>
                      <span className="text-2xl font-bold text-r69w-success">{team.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">R69 Record</span>
                      <span className="text-white font-semibold">{team.r69Wins}-{team.r69Events - team.r69Wins}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-court-green to-r69w-success"
                        style={{ width: `${team.winRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/60 text-sm">
              Membership requires 65%+ R69W rate with minimum 5 events
            </p>
            <Link
              href="/stats/69-club"
              className="inline-block mt-4 text-basketball-orange hover:text-basketball-orange/80 font-semibold"
            >
              View Full 69 Club →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
