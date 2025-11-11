'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game, GameStatus } from '@/types'
import { StatusBadge } from './StatusBadge'
import { R69Badge } from './R69Badge'
import { formatGameDate } from '@/lib/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  onClick?: (gameId: string) => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  const isLive = game.gameStatus === GameStatus.IN_PROGRESS
  const isFinal = game.gameStatus === GameStatus.FINAL

  // Calculate R69 progress for each team
  const homeProgress = Math.min((game.homeScore / 69) * 100, 100)
  const awayProgress = Math.min((game.awayScore / 69) * 100, 100)

  // Determine winner styling
  const homeWon = isFinal && game.homeScore > game.awayScore
  const awayWon = isFinal && game.awayScore > game.homeScore

  const cardContent = (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer",
        isLive && "ring-2 ring-basketball-orange"
      )}
      onClick={() => onClick?.(game.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <StatusBadge status={game.gameStatus} />
          <span className="text-xs text-muted-foreground">
            {formatGameDate(game.gameDate, 'MMM d')}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Away Team */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {game.awayTeamLogo && (
                <img
                  src={game.awayTeamLogo}
                  alt={game.awayTeamName}
                  className="h-6 w-6 object-contain"
                />
              )}
              <span className={cn(
                "font-semibold text-lg",
                awayWon && "text-r69w-success"
              )}>
                {game.awayTeamName}
              </span>
              {game.awayConference && (
                <span className="text-xs text-muted-foreground">
                  {game.awayConference}
                </span>
              )}
            </div>
            <span className={cn(
              "text-2xl font-bold",
              awayWon && "text-r69w-success"
            )}>
              {game.awayScore}
            </span>
          </div>

          {/* R69 Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-500",
                game.awayScore >= 69 ? "bg-court-green" : "bg-gray-400"
              )}
              style={{ width: `${awayProgress}%` }}
            />
            {game.awayScore >= 69 && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">69</span>
              </div>
            )}
          </div>
        </div>

        {/* Home Team */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {game.homeTeamLogo && (
                <img
                  src={game.homeTeamLogo}
                  alt={game.homeTeamName}
                  className="h-6 w-6 object-contain"
                />
              )}
              <span className={cn(
                "font-semibold text-lg",
                homeWon && "text-r69w-success"
              )}>
                {game.homeTeamName}
              </span>
              {game.homeConference && (
                <span className="text-xs text-muted-foreground">
                  {game.homeConference}
                </span>
              )}
            </div>
            <span className={cn(
              "text-2xl font-bold",
              homeWon && "text-r69w-success"
            )}>
              {game.homeScore}
            </span>
          </div>

          {/* R69 Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-500",
                game.homeScore >= 69 ? "bg-court-green" : "bg-gray-400"
              )}
              style={{ width: `${homeProgress}%` }}
            />
            {game.homeScore >= 69 && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">69</span>
              </div>
            )}
          </div>
        </div>

        {/* R69 Badge */}
        {(game.r69Event || isFinal) && (
          <div className="pt-2 border-t">
            <R69Badge
              r69Event={game.r69Event}
              gameStatus={game.gameStatus}
              homeTeamId={game.homeTeamId}
              awayTeamId={game.awayTeamId}
              homeScore={game.homeScore}
              awayScore={game.awayScore}
            />
          </div>
        )}

        {/* Venue */}
        {game.venue && (
          <div className="text-xs text-muted-foreground text-center">
            {game.venue}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return onClick ? (
    <div>{cardContent}</div>
  ) : (
    <Link href={`/game/${game.id}`}>{cardContent}</Link>
  )
}
