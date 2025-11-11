import { Game, PBPEvent, R69Prediction, R69Event } from '@/types'
import { calculateScoringPace, calculateR69Probability } from './analytics'

/**
 * Generate R69 prediction for a live game
 */
export function generateR69Prediction(
  game: Game,
  events: PBPEvent[]
): R69Prediction {
  const currentTime = events[events.length - 1]?.elapsedSeconds || 0

  // Calculate current scoring pace for each team
  const homePace = calculateScoringPace(events, game.homeTeamId)
  const awayPace = calculateScoringPace(events, game.awayTeamId)

  // Calculate probabilities and time estimates
  const prediction = calculateR69Probability(
    game.homeScore,
    game.awayScore,
    homePace,
    awayPace
  )

  // Calculate confidence level based on game progress and pace consistency
  const timeElapsedPct = currentTime / 2400 // 40 min game
  const paceConfidence = calculatePaceConfidence(events, game)
  const confidence = Math.min(100, timeElapsedPct * 50 + paceConfidence * 50)

  return {
    gameId: game.id,
    homeProb: prediction.teamProb,
    awayProb: prediction.opponentProb,
    currentPace: {
      home: homePace,
      away: awayPace,
    },
    timeEstimates: {
      home: prediction.teamTimeEstimate,
      away: prediction.opponentTimeEstimate,
    },
    confidence: Math.round(confidence),
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Calculate confidence in pace calculations
 */
function calculatePaceConfidence(events: PBPEvent[], game: Game): number {
  if (events.length < 10) return 10

  // Calculate pace variation over time windows
  const windowSize = Math.floor(events.length / 5)
  const paceVariations: number[] = []

  for (let i = 0; i < events.length - windowSize; i += windowSize) {
    const windowEvents = events.slice(i, i + windowSize)
    const homePace = calculateScoringPace(windowEvents, game.homeTeamId)
    paceVariations.push(homePace)
  }

  if (paceVariations.length < 2) return 50

  // Calculate coefficient of variation
  const mean = paceVariations.reduce((sum, v) => sum + v, 0) / paceVariations.length
  const variance =
    paceVariations.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / paceVariations.length
  const stdDev = Math.sqrt(variance)
  const cv = mean > 0 ? (stdDev / mean) * 100 : 100

  // Lower variation = higher confidence
  return Math.max(0, 100 - cv * 2)
}

/**
 * Predict final score based on current pace
 */
export function predictFinalScore(
  currentScore: number,
  currentTime: number,
  pace: number,
  totalGameTime: number = 2400
): number {
  const timeRemaining = totalGameTime - currentTime
  const minutesRemaining = timeRemaining / 60
  const pointsRemaining = pace * minutesRemaining

  return Math.round(currentScore + pointsRemaining)
}

/**
 * Calculate expected R69 time based on historical data
 */
export function calculateExpectedR69Time(
  currentScore: number,
  currentTime: number,
  pace: number
): number {
  if (currentScore >= 69) return currentTime

  const pointsNeeded = 69 - currentScore
  if (pace <= 0) return Infinity

  const minutesNeeded = pointsNeeded / pace
  return currentTime + minutesNeeded * 60
}

/**
 * Simulate game outcome probabilities
 */
export function simulateGameOutcome(
  homeScore: number,
  awayScore: number,
  homePace: number,
  awayPace: number,
  timeRemaining: number,
  iterations: number = 1000
): {
  homeWinProb: number
  awayWinProb: number
  tieProb: number
  avgFinalMargin: number
} {
  let homeWins = 0
  let awayWins = 0
  let ties = 0
  let totalMargins = 0

  for (let i = 0; i < iterations; i++) {
    // Add random variation to pace (±20%)
    const homeVariation = 0.8 + Math.random() * 0.4
    const awayVariation = 0.8 + Math.random() * 0.4

    const homeFinal = homeScore + (homePace * homeVariation * timeRemaining) / 60
    const awayFinal = awayScore + (awayPace * awayVariation * timeRemaining) / 60

    const margin = Math.round(homeFinal - awayFinal)

    if (margin > 0) homeWins++
    else if (margin < 0) awayWins++
    else ties++

    totalMargins += Math.abs(margin)
  }

  return {
    homeWinProb: (homeWins / iterations) * 100,
    awayWinProb: (awayWins / iterations) * 100,
    tieProb: (ties / iterations) * 100,
    avgFinalMargin: totalMargins / iterations,
  }
}

/**
 * Calculate momentum indicator
 */
export function calculateMomentum(
  events: PBPEvent[],
  teamId: string,
  windowSize: number = 5
): number {
  if (events.length < windowSize) return 0

  const recentEvents = events.slice(-windowSize)
  const teamPoints = recentEvents
    .filter(e => e.teamId === teamId)
    .reduce((sum, e) => sum + e.pointsScored, 0)

  const opponentPoints = recentEvents
    .filter(e => e.teamId !== teamId)
    .reduce((sum, e) => sum + e.pointsScored, 0)

  return teamPoints - opponentPoints
}

/**
 * Identify key moments in a game
 */
export function identifyKeyMoments(events: PBPEvent[], r69Event?: R69Event): PBPEvent[] {
  const keyMoments: PBPEvent[] = []

  // First score
  const firstScore = events.find(e => e.pointsScored > 0)
  if (firstScore) keyMoments.push(firstScore)

  // Lead changes
  let previousLeader: 'home' | 'away' | 'tie' = 'tie'
  for (const event of events) {
    let currentLeader: 'home' | 'away' | 'tie'

    if (event.homeScore > event.awayScore) currentLeader = 'home'
    else if (event.awayScore > event.homeScore) currentLeader = 'away'
    else currentLeader = 'tie'

    if (currentLeader !== 'tie' && previousLeader !== 'tie' && currentLeader !== previousLeader) {
      keyMoments.push(event)
    }

    previousLeader = currentLeader
  }

  // R69 event
  if (r69Event) {
    const r69Play = events.find(
      e => Math.abs(e.elapsedSeconds - r69Event.tTo69) < 5 // Within 5 seconds
    )
    if (r69Play) keyMoments.push(r69Play)
  }

  // Big scoring plays (3+ points)
  const bigPlays = events.filter(e => e.pointsScored >= 3)
  keyMoments.push(...bigPlays)

  // Remove duplicates and sort by time
  const uniqueMoments = Array.from(new Set(keyMoments.map(m => m.id)))
    .map(id => keyMoments.find(m => m.id === id)!)
    .sort((a, b) => a.elapsedSeconds - b.elapsedSeconds)

  return uniqueMoments.slice(0, 20) // Limit to top 20
}

/**
 * Calculate R69W probability based on historical data
 */
export function calculateHistoricalR69WProb(
  marginAt69: number,
  periodAt69: number,
  tTo69: number
): number {
  // Base probability from empirical data
  let baseProb = 73 // Historical R69W success rate

  // Adjust for margin
  if (marginAt69 >= 15) baseProb += 15
  else if (marginAt69 >= 10) baseProb += 10
  else if (marginAt69 >= 5) baseProb += 5
  else if (marginAt69 < 3) baseProb -= 10

  // Adjust for period (earlier = more risk)
  if (periodAt69 === 1) baseProb -= 5
  else if (periodAt69 >= 3) baseProb += 5

  // Adjust for time to 69 (faster = more dominant)
  const avgTime = 1800 // 30 minutes
  if (tTo69 < avgTime * 0.7) baseProb += 5
  else if (tTo69 > avgTime * 1.3) baseProb -= 5

  return Math.max(0, Math.min(100, baseProb))
}
