/**
 * R69W Dashboard - TypeScript Type Definitions
 */

// ============================================
// ENUMS
// ============================================

export enum League {
  MENS = 'mens',
  WOMENS = 'womens',
}

export enum GameStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  FINAL = 'final',
  POSTPONED = 'postponed',
  CANCELED = 'canceled',
}

export enum GameType {
  REGULAR = 'regular',
  CONFERENCE = 'conference',
  TOURNAMENT = 'tournament',
}

export enum EventType {
  SHOT_MADE = 'shot_made',
  SHOT_MISSED = 'shot_missed',
  FREE_THROW = 'free_throw',
  REBOUND = 'rebound',
  TURNOVER = 'turnover',
  FOUL = 'foul',
  TIMEOUT = 'timeout',
}

// ============================================
// CORE DATA MODELS
// ============================================

export interface Game {
  id: string;
  gameId: string;
  gameDate: Date | string;
  season: string;
  league: League;

  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeConference?: string;
  awayConference?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;

  venue?: string;
  gameType: GameType;

  homeScore: number;
  awayScore: number;
  finalMargin?: number;

  gameStatus: GameStatus;
  totalPeriods: number;
  overtimeFlag: boolean;

  r69Event?: R69Event;
  analytics?: R69Analytics;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface R69Event {
  id: string;
  gameId: string;
  
  teamId: string;
  teamName: string;
  
  tTo69: number; // seconds elapsed
  periodAt69: number;
  marginAt69: number;
  scoreAt69Team: number;
  scoreAt69Opponent: number;
  
  r69w: boolean; // Won after hitting 69 first
  finalMargin?: number;
  
  playDescription?: string;
  
  createdAt: Date | string;
}

export interface PBPEvent {
  id: string;
  gameId: string;
  
  sequenceNumber: number;
  period: number;
  clockSeconds: number;
  elapsedSeconds: number;
  
  teamId?: string;
  playerName?: string;
  eventType: string;
  pointsScored: number;
  
  homeScore: number;
  awayScore: number;
  
  description: string;
  
  createdAt: Date | string;
}

export interface Team {
  id: string;
  teamId: string;
  teamName: string;
  conference?: string;
  league: League;
  season: string;
  
  gamesPlayed: number;
  r69Wins: number;
  r69Losses: number;
  r69WinPct?: number;
  avgTTo69?: number;
  avgMarginAt69?: number;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface R69Analytics {
  id: string;
  gameId: string;
  
  r69PaceIndex?: number;
  r69LeadDuration?: number;
  r69SwingMargin?: number;
  comeback69L: boolean;
  
  niceScore: boolean;
  doubleNice: boolean;
  
  homePossessions?: number;
  awayPossessions?: number;
  paceRating?: number;
  
  createdAt: Date | string;
}

// ============================================
// UI COMPONENT PROPS
// ============================================

export interface GameTrackerProps {
  gameId: string;
  onRefresh?: () => void;
}

export interface ScoringWormChartProps {
  events: PBPEvent[];
  r69Event?: R69Event;
  homeTeamName: string;
  awayTeamName: string;
}

export interface R69BadgeProps {
  r69Event?: R69Event;
  gameStatus: GameStatus;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export interface MomentumMeterProps {
  r69Event?: R69Event;
  finalHomeScore: number;
  finalAwayScore: number;
}

export interface GameCardProps {
  game: Game;
  onClick?: (gameId: string) => void;
}

export interface TodaysBoardProps {
  initialDate?: Date;
  league?: League;
}

export interface LeaderboardProps {
  view: 'teams' | 'conferences';
  split: 'all' | 'home' | 'away';
  season: string;
  league?: League;
}

export interface StatExplorerProps {
  metric: R69Metric;
  filters: StatFilters;
}

export interface R69PredictorProps {
  gameId: string;
  realTime?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  conference?: string;
  league: League;
  
  gamesPlayed: number;
  r69Wins: number;
  r69Losses: number;
  r69WinPct: number;
  avgTTo69: number;
  avgMarginAt69: number;
  
  rank?: number;
}

export interface ConferenceStats {
  conference: string;
  league: League;
  season: string;
  
  teamsCount: number;
  totalGames: number;
  totalR69Wins: number;
  conferenceR69WPct: number;
  avgTTo69: number;
  avgMarginAt69: number;
}

export interface R69Prediction {
  gameId: string;
  homeProb: number;
  awayProb: number;
  currentPace: {
    home: number;
    away: number;
  };
  timeEstimates: {
    home: number;
    away: number;
  };
  confidence: number;
  lastUpdated: Date | string;
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface GameFilters {
  league?: League;
  conference?: string;
  status?: GameStatus;
  gameType?: GameType;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  teamId?: string;
}

export interface StatFilters {
  season: string;
  league?: League;
  conference?: string;
  gameType?: GameType;
  minGames?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
}

export interface ScoringChartData {
  time: number;
  homeScore: number;
  awayScore: number;
  period: number;
  r69Marker?: boolean;
}

export interface DistributionData {
  bin: string;
  count: number;
  percentage: number;
}

// ============================================
// METRICS & ANALYTICS
// ============================================

export type R69Metric =
  | 'R69M'        // Margin at 69
  | 'T69'         // Time to 69
  | 'P69'         // Period at 69
  | 'R69D'        // Time difference between teams hitting 69
  | 'Comeback69L' // Comeback after losing lead at 69
  | 'PaceIndex'   // Pace index
  | 'LeadDuration'// Lead duration after 69
  | 'SwingMargin' // Swing margin
  | 'Nice'        // Nice score percentage
  | 'DoubleNice'  // Double nice percentage
  | 'R69WPct';    // R69W win percentage

export interface MetricDefinition {
  key: R69Metric;
  label: string;
  description: string;
  formula: string;
  unit: string;
  visualizationType: 'bar' | 'line' | 'scatter' | 'heatmap' | 'leaderboard';
}

// ============================================
// WEBSOCKET & REAL-TIME
// ============================================

export interface WebSocketMessage {
  type: 'game_update' | 'r69_event' | 'score_update' | 'game_final';
  gameId: string;
  timestamp: Date | string;
  data: any;
}

export interface GameUpdate {
  gameId: string;
  homeScore: number;
  awayScore: number;
  gameStatus: GameStatus;
  period: number;
  clock: string;
  lastPlay?: PBPEvent;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface BoardState {
  selectedLeague: League;
  selectedConference?: string;
  selectedStatus: GameStatus | 'all';
  selectedDate: Date;
  viewMode: 'grid' | 'list';
}

export interface TrackerState {
  selectedPeriod: number;
  playbackSpeed: number;
  showR69Only: boolean;
  highlightTeam?: string;
}

export interface LeaderboardState {
  view: 'teams' | 'conferences';
  split: 'all' | 'home' | 'away';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: StatFilters;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface R69ProgressData {
  team: 'home' | 'away';
  currentScore: number;
  targetScore: number;
  percentage: number;
  estimatedTime?: number;
}

export interface GameSummary {
  game: Game;
  r69Event?: R69Event;
  keyMoments: PBPEvent[];
  stats: {
    totalPoints: number;
    biggestLead: number;
    leadChanges: number;
    tiesCount: number;
  };
}

export interface NiceGame {
  game: Game;
  niceType: 'single' | 'double';
  niceTeams: string[];
}

export interface PrematureGame {
  game: Game;
  r69Event: R69Event;
  blowDetails: {
    maxLead: number;
    leadLostAt: number;
    finalMargin: number;
  };
}

// ============================================
// ERROR TYPES
// ============================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}
