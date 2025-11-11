import { Game, PBPEvent, R69Event, R69Analytics } from '@/types'

/**
 * Calculate pace index for a game
 * Formula: (Total Points / Game Time) * 40 (normalized to 40 min game)
 */
export function calculatePaceIndex(totalPoints: number, gameTimeSeconds: number): number {
  if (gameTimeSeconds === 0) return 0
  const pointsPerMinute = totalPoints / (gameTimeSeconds / 60)
  return Number((pointsPerMinute * 40).toFixed(4))
}

/**
 * Calculate R69 pace index
 * How fast team reached 69 compared to average
 */
export function calculateR69PaceIndex(tTo69: number, avgTTo69: number = 1800): number {
  if (tTo69 === 0) return 0
  return Number((avgTTo69 / tTo69).toFixed(4))
}

/**
 * Calculate win probability based on current game state
 */
export function calculateWinProbability(
  currentScore: number,
  opponentScore: number,
  timeRemaining: number,
  totalGameTime: number = 2400
): number {
  const margin = currentScore - opponentScore
  const timeRemainingPct = timeRemaining / totalGameTime

  // Simple logistic regression model
  // Factors: margin, time remaining, pace
  const marginFactor = margin * 3.5
  const timeFactor = (1 - timeRemainingPct) * 20

  const logit = marginFactor + timeFactor - 10
  const probability = 1 / (1 + Math.exp(-logit))

  return Math.max(0, Math.min(100, probability * 100))
}

/**
 * Calculate probability of reaching 69 first
 */
export function calculateR69Probability(
  teamScore: number,
  opponentScore: number,
  teamPace: number,
  opponentPace: number
): {
  teamProb: number
  opponentProb: number
  teamTimeEstimate: number
  opponentTimeEstimate: number
} {
  const targetScore = 69

  // Calculate estimated time to reach 69 for each team
  const teamPointsNeeded = targetScore - teamScore
  const opponentPointsNeeded = targetScore - opponentScore

  const teamTimeEstimate = teamPace > 0 ? (teamPointsNeeded / teamPace) * 60 : Infinity
  const opponentTimeEstimate = opponentPace > 0 ? (opponentPointsNeeded / opponentPace) * 60 : Infinity

  // Calculate probabilities based on time estimates
  let teamProb = 50
  let opponentProb = 50

  if (teamTimeEstimate < Infinity && opponentTimeEstimate < Infinity) {
    const timeDiff = opponentTimeEstimate - teamTimeEstimate
    // Logistic function for probability
    teamProb = 100 / (1 + Math.exp(-timeDiff / 60))
    opponentProb = 100 - teamProb
  } else if (teamTimeEstimate < Infinity) {
    teamProb = 100
    opponentProb = 0
  } else if (opponentTimeEstimate < Infinity) {
    teamProb = 0
    opponentProb = 100
  }

  return {
    teamProb: Math.round(teamProb),
    opponentProb: Math.round(opponentProb),
    teamTimeEstimate: Math.round(teamTimeEstimate),
    opponentTimeEstimate: Math.round(opponentTimeEstimate),
  }
}

/**
 * Calculate scoring pace from play-by-play events
 */
export function calculateScoringPace(events: PBPEvent[], teamId: string): number {
  if (events.length === 0) return 0

  const teamEvents = events.filter(e => e.teamId === teamId && e.pointsScored > 0)
  if (teamEvents.length === 0) return 0

  const totalPoints = teamEvents.reduce((sum, e) => sum + e.pointsScored, 0)
  const timeElapsed = events[events.length - 1]?.elapsedSeconds || 1

  return Number(((totalPoints / timeElapsed) * 60).toFixed(2)) // Points per minute
}

/**
 * Calculate lead duration after R69 event
 */
export function calculateLeadDuration(
  events: PBPEvent[],
  r69Event: R69Event,
  r69TeamId: string,
  isHomeTeam: boolean
): number {
  const r69Time = r69Event.tTo69

  // Find events after R69
  const afterR69 = events.filter(e => e.elapsedSeconds > r69Time)
  if (afterR69.length === 0) return 0

  let leadSeconds = 0
  let lastTime = r69Time

  for (const event of afterR69) {
    const timeDiff = event.elapsedSeconds - lastTime

    // Check if R69 team is still leading
    const isLeading = isHomeTeam
      ? event.homeScore > event.awayScore
      : event.awayScore > event.homeScore

    if (isLeading) {
      leadSeconds += timeDiff
    }

    lastTime = event.elapsedSeconds
  }

  return leadSeconds
}

/**
 * Calculate swing margin (margin change after R69)
 */
export function calculateSwingMargin(
  r69Margin: number,
  finalMargin: number,
  r69TeamWon: boolean
): number {
  if (r69TeamWon) {
    return finalMargin - r69Margin
  } else {
    return -(finalMargin + r69Margin)
  }
}

/**
 * Detect comeback after losing lead at 69
 */
export function detectComeback69L(
  events: PBPEvent[],
  r69Event: R69Event,
  r69TeamId: string,
  isHomeTeam: boolean
): boolean {
  const r69Time = r69Event.tTo69
  const afterR69 = events.filter(e => e.elapsedSeconds > r69Time)

  if (afterR69.length === 0) return false

  let lostLead = false
  let regainedLead = false

  for (const event of afterR69) {
    const currentlyLeading = isHomeTeam
      ? event.homeScore > event.awayScore
      : event.awayScore > event.homeScore

    if (!currentlyLeading && !lostLead) {
      lostLead = true
    }

    if (lostLead && currentlyLeading) {
      regainedLead = true
      break
    }
  }

  return lostLead && regainedLead
}

/**
 * Calculate number of lead changes
 */
export function calculateLeadChanges(events: PBPEvent[]): number {
  let leadChanges = 0
  let previousLeader: 'home' | 'away' | 'tie' = 'tie'

  for (const event of events) {
    let currentLeader: 'home' | 'away' | 'tie'

    if (event.homeScore > event.awayScore) {
      currentLeader = 'home'
    } else if (event.awayScore > event.homeScore) {
      currentLeader = 'away'
    } else {
      currentLeader = 'tie'
    }

    if (currentLeader !== 'tie' && previousLeader !== 'tie' && currentLeader !== previousLeader) {
      leadChanges++
    }

    previousLeader = currentLeader
  }

  return leadChanges
}

/**
 * Calculate number of ties
 */
export function calculateTies(events: PBPEvent[]): number {
  let ties = 0
  let previouslyTied = false

  for (const event of events) {
    const isTied = event.homeScore === event.awayScore

    if (isTied && !previouslyTied) {
      ties++
    }

    previouslyTied = isTied
  }

  return ties
}

/**
 * Find biggest lead in game
 */
export function findBiggestLead(events: PBPEvent[]): {
  homeMax: number
  awayMax: number
  overall: number
} {
  let homeMax = 0
  let awayMax = 0

  for (const event of events) {
    const margin = event.homeScore - event.awayScore

    if (margin > homeMax) homeMax = margin
    if (-margin > awayMax) awayMax = -margin
  }

  return {
    homeMax,
    awayMax,
    overall: Math.max(homeMax, awayMax),
  }
}

/**
 * Calculate possession count (estimated)
 */
export function calculatePossessions(events: PBPEvent[], teamId?: string): number {
  const possessionEvents = events.filter(e =>
    e.eventType.includes('shot') || e.eventType.includes('turnover')
  )

  if (teamId) {
    return possessionEvents.filter(e => e.teamId === teamId).length
  }

  return possessionEvents.length
}

/**
 * Identify nice score games (exactly 69 or 96 points)
 */
export function isNiceScore(score: number): boolean {
  return score === 69 || score === 96
}

/**
 * Check if game is double nice (both teams 69+)
 */
export function isDoubleNice(homeScore: number, awayScore: number): boolean {
  return homeScore >= 69 && awayScore >= 69
}

/**
 * Calculate R69 analytics for a game
 */
export function calculateR69Analytics(
  game: Game,
  events: PBPEvent[],
  r69Event?: R69Event
): Partial<R69Analytics> {
  if (!r69Event) {
    return {
      niceScore: isNiceScore(game.homeScore) || isNiceScore(game.awayScore),
      doubleNice: isDoubleNice(game.homeScore, game.awayScore),
    }
  }

  const r69TeamId = r69Event.teamId
  const isHomeTeam = game.homeTeamId === r69TeamId

  const r69PaceIndex = calculateR69PaceIndex(r69Event.tTo69)
  const r69LeadDuration = calculateLeadDuration(events, r69Event, r69TeamId, isHomeTeam)
  const r69SwingMargin = calculateSwingMargin(
    r69Event.marginAt69,
    game.finalMargin || 0,
    r69Event.r69w
  )
  const comeback69L = detectComeback69L(events, r69Event, r69TeamId, isHomeTeam)

  const homePossessions = calculatePossessions(events, game.homeTeamId)
  const awayPossessions = calculatePossessions(events, game.awayTeamId)
  const totalPoints = game.homeScore + game.awayScore
  const gameTime = events[events.length - 1]?.elapsedSeconds || 2400
  const paceRating = calculatePaceIndex(totalPoints, gameTime)

  return {
    r69PaceIndex,
    r69LeadDuration,
    r69SwingMargin,
    comeback69L,
    niceScore: isNiceScore(game.homeScore) || isNiceScore(game.awayScore),
    doubleNice: isDoubleNice(game.homeScore, game.awayScore),
    homePossessions,
    awayPossessions,
    paceRating,
  }
}
