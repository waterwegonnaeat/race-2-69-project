'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Team {
  teamId: string
  teamName: string
  conference?: string
  league: string
}

interface TeamSearchProps {
  onTeamSelect: (teamName: string | null) => void
  selectedTeam?: string | null
}

export function TeamSearch({ onTeamSelect, selectedTeam }: TeamSearchProps) {
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [justSelected, setJustSelected] = useState(false)
  const [userIsTyping, setUserIsTyping] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Update query when selectedTeam changes externally (e.g., from clicking a logo)
  useEffect(() => {
    if (selectedTeam && selectedTeam !== query) {
      setQuery(selectedTeam)
    } else if (!selectedTeam && query) {
      setQuery('')
    }
  }, [selectedTeam])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for teams
  useEffect(() => {
    const searchTeams = async () => {
      if (query.length < 2) {
        setTeams([])
        setIsOpen(false)
        return
      }

      // Don't search if we just selected a team
      if (justSelected) {
        setJustSelected(false)
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(`/api/teams/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setTeams(data.teams || [])
        // Only open dropdown if user is actively typing
        if (userIsTyping) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Team search error:', error)
        setTeams([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchTeams, 300)
    return () => clearTimeout(debounce)
  }, [query, justSelected, userIsTyping])

  const handleSelect = (team: Team) => {
    setJustSelected(true)
    setUserIsTyping(false)
    setQuery(team.teamName)
    onTeamSelect(team.teamName)
    setIsOpen(false)
    setTeams([])
    // Blur the input to prevent it from reopening on focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    onTeamSelect(null)
    setTeams([])
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className={cn(
            "h-5 w-5 transition-all duration-200",
            isLoading ? "animate-pulse text-basketball-orange" : "text-white/50 group-hover:text-white/70"
          )} />
        </div>
        <Input
          type="text"
          placeholder="Type team name (e.g., Duke, Kansas, UNC...)"
          value={query}
          onChange={(e) => {
            setUserIsTyping(true)
            setQuery(e.target.value)
          }}
          onFocus={() => {
            setUserIsTyping(true)
            if (query.length >= 2 && teams.length > 0) {
              setIsOpen(true)
            }
          }}
          className={cn(
            "pl-12 pr-12 h-14 text-lg font-medium",
            "bg-white/10 border-2 border-white/20 text-white",
            "placeholder:text-white/40 placeholder:font-normal",
            "focus:border-basketball-orange focus:ring-4 focus:ring-basketball-orange/20",
            "hover:bg-white/15 hover:border-white/30",
            "transition-all duration-200",
            "rounded-xl"
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "text-white/50 hover:text-white",
              "transition-all duration-200 hover:scale-110",
              "p-1 rounded-lg hover:bg-white/10"
            )}
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute left-4 -bottom-6 text-xs text-basketball-orange animate-pulse flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-basketball-orange animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full bg-basketball-orange animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full bg-basketball-orange animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-1">Searching...</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute z-[9999] mt-3 w-full",
          "rounded-2xl border-2 border-white/20",
          "bg-gradient-to-b from-black/98 to-black/95 backdrop-blur-2xl",
          "shadow-2xl shadow-black/50",
          "overflow-visible",
          "animate-in fade-in-0 slide-in-from-top-2 duration-200"
        )}>
          {teams.length > 0 ? (
            <>
              <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Found {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {teams.map((team) => (
                  <button
                    key={team.teamId}
                    onClick={() => handleSelect(team)}
                    className={cn(
                      "w-full px-5 py-4 text-left",
                      "hover:bg-gradient-to-r hover:from-basketball-orange/20 hover:to-transparent",
                      "transition-all duration-200",
                      "border-b border-white/5 last:border-b-0",
                      "group relative overflow-hidden"
                    )}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-basketball-orange/0 via-basketball-orange/5 to-basketball-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-base text-white group-hover:text-basketball-orange transition-colors duration-200">
                          {team.teamName}
                        </div>
                        {team.conference && (
                          <div className="text-sm text-white/50 mt-1 flex items-center gap-2">
                            <span>{team.conference}</span>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span>{team.league === 'MENS' ? "Men's" : "Women's"} Basketball</span>
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0 translate-x-2">
                        <div className="w-8 h-8 rounded-full bg-basketball-orange/20 flex items-center justify-center">
                          <span className="text-basketball-orange text-lg">→</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white/30" />
              </div>
              <div className="text-white/60 font-medium mb-1">No teams found</div>
              <div className="text-sm text-white/40">Try a different search term</div>
            </div>
          ) : null}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 140, 66, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 140, 66, 0.5);
        }
      `}</style>
    </div>
  )
}
