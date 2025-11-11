'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { R69Badge } from '@/components/R69Badge'
import { TeamWithLogo } from '@/components/TeamLogo'
import { cn } from '@/lib/utils'
import { Game, GameStatus } from '@/types'
import { formatTime, formatGameDate } from '@/lib/formatters'
import { Trophy, Calendar, MapPin, Clock } from 'lucide-react'

interface GameHeaderProps {
  game: Game
  className?: string
}

export function GameHeader({ game, className }: GameHeaderProps) {
  const isLive = game.gameStatus === GameStatus.IN_PROGRESS
  const isFinal = game.gameStatus === GameStatus.FINAL

  const homeWon = isFinal && game.homeScore && game.awayScore && game.homeScore > game.awayScore
  const awayWon = isFinal && game.homeScore && game.awayScore && game.awayScore > game.homeScore

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Game Status Bar */}
      <div className={cn(
        'px-6 py-3 border-b flex items-center justify-between',
        isLive && 'bg-gradient-to-r from-basketball-orange/10 to-red-600/10'
      )}>
        <div className="flex items-center gap-3">
          <StatusBadge status={game.gameStatus} />
          {game.r69Event && (
            <R69Badge
              r69Event={game.r69Event}
              gameStatus={game.gameStatus}
              homeTeamId={game.homeTeamId}
              awayTeamId={game.awayTeamId}
              homeScore={game.homeScore || 0}
              awayScore={game.awayScore || 0}
            />
          )}
          {game.gameType && (
            <Badge variant="outline" className="capitalize">
              {game.gameType.toLowerCase()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatGameDate(game.gameDate)}</span>
          </div>
          {game.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{game.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Team Scores */}
      <div className="p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Away Team */}
          <div className={cn(
            'text-center space-y-2',
            awayWon && 'scale-105'
          )}>
            <div className="flex items-center justify-center gap-2">
              {awayWon && <Trophy className="h-5 w-5 text-victory-gold" />}
              <TeamWithLogo
                teamName={game.awayTeamName}
                logoUrl={game.awayTeamLogo}
                size="lg"
                clickable={true}
                layout="vertical"
                nameClassName={cn(
                  'text-3xl font-bold',
                  awayWon && 'text-foreground'
                )}
              />
            </div>
            {game.awayConference && (
              <p className="text-sm text-muted-foreground">{game.awayConference}</p>
            )}
            <div className={cn(
              'text-6xl font-bold',
              awayWon ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {game.awayScore ?? '-'}
            </div>
          </div>

          {/* VS / @ Separator */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl font-bold text-muted-foreground">
              @
            </div>
            {isLive && (
              <div className="flex items-center gap-1 text-xs text-basketball-orange font-semibold">
                <Clock className="h-3 w-3 animate-pulse" />
                <span>LIVE</span>
              </div>
            )}
            {isFinal && game.finalMargin !== undefined && (
              <div className="text-xs text-muted-foreground">
                Final: {Math.abs(game.finalMargin)}
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className={cn(
            'text-center space-y-2',
            homeWon && 'scale-105'
          )}>
            <div className="flex items-center justify-center gap-2">
              {homeWon && <Trophy className="h-5 w-5 text-victory-gold" />}
              <TeamWithLogo
                teamName={game.homeTeamName}
                logoUrl={game.homeTeamLogo}
                size="lg"
                clickable={true}
                layout="vertical"
                nameClassName={cn(
                  'text-3xl font-bold',
                  homeWon && 'text-foreground'
                )}
              />
            </div>
            {game.homeConference && (
              <p className="text-sm text-muted-foreground">{game.homeConference}</p>
            )}
            <div className={cn(
              'text-6xl font-bold',
              homeWon ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {game.homeScore ?? '-'}
            </div>
          </div>
        </div>

        {/* R69 Event Details */}
        {game.r69Event && (
          <div className={cn(
            'mt-8 p-4 rounded-lg border-2',
            game.r69Event.r69w
              ? 'bg-r69w-success/10 border-r69w-success'
              : 'bg-premature69-fail/10 border-premature69-fail'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  🎯 R69 Event: {game.r69Event.teamName}
                  {game.r69Event.r69w ? (
                    <span className="text-r69w-success">Won!</span>
                  ) : (
                    <span className="text-premature69-fail">Lost</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Hit 69 in Period {game.r69Event.periodAt69} with a {game.r69Event.marginAt69}-point lead
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">69</div>
                <div className="text-xs text-muted-foreground">
                  Opp: {game.r69Event.scoreAt69Opponent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
