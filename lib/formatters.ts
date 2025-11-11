import { GameStatus, League } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}

/**
 * Format clock time (seconds remaining in period) to M:SS
 */
export function formatClock(clockSeconds: number): string {
  const minutes = Math.floor(clockSeconds / 60)
  const seconds = clockSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format win percentage for display
 */
export function formatWinPct(wins: number, total: number): string {
  if (total === 0) return '0.0%'
  return formatPercent((wins / total) * 100, 1)
}

/**
 * Format game date
 */
export function formatGameDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Format date (alias for formatGameDate)
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  return formatGameDate(date, formatStr)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Format score with margin
 */
export function formatScore(score1: number, score2: number): string {
  return `${score1}-${score2}`
}

/**
 * Format margin with +/- sign
 */
export function formatMargin(margin: number): string {
  if (margin > 0) return `+${margin}`
  if (margin < 0) return `${margin}`
  return 'TIE'
}

/**
 * Format game status for display
 */
export function formatGameStatus(status: GameStatus, period?: number, clock?: string): string {
  switch (status) {
    case GameStatus.SCHEDULED:
      return 'Upcoming'
    case GameStatus.IN_PROGRESS:
      if (period && clock) {
        const half = period === 1 ? '1st Half' : period === 2 ? '2nd Half' : `OT${period - 2}`
        return `${half} - ${clock}`
      }
      return 'Live'
    case GameStatus.FINAL:
      return 'Final'
    case GameStatus.POSTPONED:
      return 'Postponed'
    case GameStatus.CANCELED:
      return 'Canceled'
    default:
      return status
  }
}

/**
 * Format league name
 */
export function formatLeague(league: League): string {
  return league === League.MENS ? "Men's" : "Women's"
}

/**
 * Format conference name (title case)
 */
export function formatConference(conference: string): string {
  return conference
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format period name (1st Half, 2nd Half, OT, etc.)
 */
export function formatPeriod(period: number): string {
  if (period === 1) return '1st Half'
  if (period === 2) return '2nd Half'
  if (period === 3) return 'OT'
  return `OT${period - 2}`
}

/**
 * Format rank with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function formatRank(rank: number): string {
  const j = rank % 10
  const k = rank % 100

  if (j === 1 && k !== 11) return `${rank}st`
  if (j === 2 && k !== 12) return `${rank}nd`
  if (j === 3 && k !== 13) return `${rank}rd`
  return `${rank}th`
}

/**
 * Format decimal number
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format R69 badge text
 */
export function formatR69Badge(r69w: boolean): string {
  return r69w ? 'R69W' : 'Premature69'
}

/**
 * Get color class for R69 result
 */
export function getR69Color(r69w: boolean): string {
  return r69w ? 'text-r69w-success' : 'text-premature-69'
}

/**
 * Get background color class for R69 result
 */
export function getR69BgColor(r69w: boolean): string {
  return r69w ? 'bg-r69w-success' : 'bg-premature-69'
}

/**
 * Format team abbreviation from name
 */
export function getTeamAbbr(teamName: string): string {
  // Common abbreviations
  const abbrs: Record<string, string> = {
    'Duke': 'DUKE',
    'North Carolina': 'UNC',
    'Kansas': 'KU',
    'Kentucky': 'UK',
    'UCLA': 'UCLA',
    'Michigan': 'MICH',
    'Gonzaga': 'GONZ',
  }

  if (abbrs[teamName]) return abbrs[teamName]

  // Generate abbreviation from first letters
  const words = teamName.split(' ')
  if (words.length === 1) {
    return teamName.slice(0, 4).toUpperCase()
  }

  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
}
