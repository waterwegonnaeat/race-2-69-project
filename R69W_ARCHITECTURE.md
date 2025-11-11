# R69W: Race-to-69 & Win Dashboard
## Technical Architecture & Implementation Guide

---

## 📋 Executive Summary

**R69W** is a real-time NCAA basketball analytics platform that tracks the "Race to 69" phenomenon—when a team first reaches 69 points—and correlates it with game outcomes.

**Core Value Proposition**: Transform play-by-play data into actionable tempo analytics, predictive insights, and entertaining visualizations around a statistically significant milestone.

---

## 🏗️ System Architecture

### Tech Stack Recommendation

**Frontend**
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts or D3.js for custom visualizations
- **Real-time**: Socket.io or Server-Sent Events (SSE)
- **State Management**: Zustand or React Query

**Backend**
- **API Framework**: Next.js API Routes or Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for real-time game state
- **Jobs/Workers**: Bull or Agenda for periodic updates
- **Data Pipeline**: Python scripts for ETL

**Data Sources**
- **Primary**: ESPN API (unofficial but robust)
- **Secondary**: NCAA Stats API, SportsRadar (paid)
- **Backup**: Web scraping with Puppeteer/Playwright

**Infrastructure**
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Database**: Supabase or Neon (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Uptime Robot

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id VARCHAR(50) UNIQUE NOT NULL,
  game_date DATE NOT NULL,
  season VARCHAR(10) NOT NULL,
  league VARCHAR(20) NOT NULL, -- 'mens' or 'womens'
  
  home_team_id VARCHAR(50) NOT NULL,
  away_team_id VARCHAR(50) NOT NULL,
  home_team_name VARCHAR(100) NOT NULL,
  away_team_name VARCHAR(100) NOT NULL,
  home_conference VARCHAR(50),
  away_conference VARCHAR(50),
  
  venue VARCHAR(100),
  game_type VARCHAR(20), -- 'regular', 'conference', 'tournament'
  
  home_score INT,
  away_score INT,
  final_margin INT,
  
  game_status VARCHAR(20), -- 'scheduled', 'in_progress', 'final'
  total_periods INT DEFAULT 2,
  overtime_flag BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- R69 Events table (the core metric)
CREATE TABLE r69_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  
  team_id VARCHAR(50) NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  
  t_to_69 INT NOT NULL, -- seconds elapsed when team hit 69
  period_at_69 INT NOT NULL, -- which period (1, 2, OT1, etc)
  margin_at_69 INT NOT NULL, -- lead when hitting 69
  score_at_69_team INT DEFAULT 69,
  score_at_69_opponent INT NOT NULL,
  
  r69w BOOLEAN NOT NULL, -- true if team won after hitting 69 first
  final_margin INT,
  
  play_description TEXT, -- the exact play that hit 69
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Play-by-Play events
CREATE TABLE pbp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  
  sequence_number INT NOT NULL,
  period INT NOT NULL,
  clock_seconds INT NOT NULL, -- seconds remaining in period
  elapsed_seconds INT NOT NULL, -- total seconds from game start
  
  team_id VARCHAR(50),
  player_name VARCHAR(100),
  
  event_type VARCHAR(30), -- 'shot_made', 'shot_missed', 'free_throw', etc
  points_scored INT DEFAULT 0,
  
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(game_id, sequence_number)
);

-- Teams aggregate stats
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(50) UNIQUE NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  conference VARCHAR(50),
  league VARCHAR(20),
  
  games_played INT DEFAULT 0,
  r69_wins INT DEFAULT 0,
  r69_losses INT DEFAULT 0,
  avg_t_to_69 DECIMAL(10,2),
  avg_margin_at_69 DECIMAL(10,2),
  
  season VARCHAR(10) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, season)
);

-- Advanced analytics cache
CREATE TABLE r69_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  
  -- Derived metrics
  r69_pace_index DECIMAL(5,4), -- T69 / total_game_length
  r69_lead_duration INT, -- seconds from 69 until lead lost (if applicable)
  r69_swing_margin INT, -- max_margin_after_69 - final_margin
  comeback_69l BOOLEAN, -- lost after hitting 69 first
  
  nice_score BOOLEAN, -- one team scored exactly 69
  double_nice BOOLEAN, -- both teams scored 69+
  
  home_possessions INT,
  away_possessions INT,
  pace_rating DECIMAL(5,2), -- possessions per 40 minutes
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_date ON games(game_date DESC);
CREATE INDEX idx_games_status ON games(game_status);
CREATE INDEX idx_games_league ON games(league);
CREATE INDEX idx_r69_events_team ON r69_events(team_id);
CREATE INDEX idx_r69_events_game ON r69_events(game_id);
CREATE INDEX idx_pbp_game_sequence ON pbp_events(game_id, sequence_number);
```

---

## 🔄 Data Pipeline

### 1. Game Discovery & Scheduling

**Frequency**: Every 30 minutes during season

```python
# Pseudocode
def discover_games():
    today = datetime.now()
    games = fetch_espn_scoreboard(date=today)
    
    for game in games:
        upsert_game_to_db({
            'game_id': game.id,
            'home_team': game.home,
            'away_team': game.away,
            'game_status': game.status,
            'game_date': game.date
        })
```

### 2. Live Game Updates

**Frequency**: Every 10-15 seconds for in-progress games

```python
def update_live_games():
    active_games = get_games_where(status='in_progress')
    
    for game in active_games:
        pbp_data = fetch_play_by_play(game.game_id)
        
        # Insert new plays since last update
        new_plays = filter_new_plays(pbp_data, game.last_sequence)
        insert_pbp_events(new_plays)
        
        # Check if R69 event occurred
        r69_event = detect_r69_event(game.game_id)
        if r69_event and not game.r69_recorded:
            insert_r69_event(r69_event)
            
        # Update game scores
        update_game_scores(game.game_id, pbp_data.current_score)
```

### 3. R69 Detection Algorithm

```python
def detect_r69_event(game_id):
    """
    Detect when a team hits 69 points first
    """
    plays = get_pbp_events(game_id, order_by='sequence_number')

    r69_triggered = False
    winning_team = None

    for play in plays:
        home_score = play.home_score
        away_score = play.away_score

        # Check if home team hit 69 first
        if home_score >= 69 and away_score < 69:
            if not r69_triggered:
                r69_triggered = True
                winning_team = 'home'
                r69_data = {
                    'team': play.home_team,
                    't_to_69': play.elapsed_seconds,
                    'period_at_69': play.period,
                    'margin_at_69': home_score - away_score,
                    'score_opponent': away_score,
                    'play_description': play.description
                }
                break
        
        # Check away team
        if away_score >= 69 and home_score < 69 and away_score > home_score:
            if not r69_triggered:
                r69_triggered = True
                winning_team = 'away'
                r69_data = {
                    'team': play.away_team,
                    't_to_69': play.elapsed_seconds,
                    'period_at_69': play.period,
                    'margin_at_69': away_score - home_score,
                    'score_opponent': home_score,
                    'play_description': play.description
                }
                break
    
    return r69_data if r69_triggered else None
```

### 4. Post-Game Analytics

**Frequency**: Once when game status changes to 'final'

```python
def calculate_post_game_analytics(game_id):
    game = get_game(game_id)
    r69_event = get_r69_event(game_id)
    
    if not r69_event:
        return  # No R69 event occurred
    
    # Determine if R69W is true
    r69w = (
        (r69_event.team_id == game.home_team_id and game.home_score > game.away_score) or
        (r69_event.team_id == game.away_team_id and game.away_score > game.home_score)
    )
    
    update_r69_event(r69_event.id, {
        'r69w': r69w,
        'final_margin': abs(game.home_score - game.away_score)
    })
    
    # Calculate advanced metrics
    analytics = {
        'r69_pace_index': calculate_pace_index(game_id),
        'r69_lead_duration': calculate_lead_duration(game_id, r69_event),
        'r69_swing_margin': calculate_swing_margin(game_id, r69_event),
        'comeback_69l': not r69w,
        'nice_score': check_nice_score(game),
        'double_nice': check_double_nice(game)
    }
    
    insert_r69_analytics(game_id, analytics)
    
    # Update team aggregates
    update_team_stats(r69_event.team_id)
```

---

## 🎨 Frontend Features

### 1. Game Tracker Component

**Purpose**: Real-time visualization of scoring progression

**Components**:
```typescript
// GameTracker.tsx
interface GameTrackerProps {
  gameId: string;
}

export function GameTracker({ gameId }: GameTrackerProps) {
  const { game, pbpEvents, r69Event } = useGameData(gameId);
  
  return (
    <div className="game-tracker">
      <GameHeader game={game} />
      <ScoringWormChart events={pbpEvents} r69Event={r69Event} />
      <R69Badge event={r69Event} game={game} />
      <MomentumMeter r69Event={r69Event} finalScore={game.scores} />
      <PlayByPlayTimeline events={pbpEvents} />
    </div>
  );
}
```

**Key Features**:
- Dual-line chart with 69-point threshold marker
- Interactive hover states showing play details
- Real-time updates via WebSocket/SSE
- R69W badge with animated reveal

### 2. Today's Board

**Purpose**: Dashboard of all current/recent games

```typescript
// TodaysBoard.tsx
export function TodaysBoard() {
  const { games, isLoading } = useTodaysGames();
  const [filters, setFilters] = useState<Filters>({
    league: 'all',
    conference: 'all',
    status: 'all'
  });
  
  const filteredGames = applyFilters(games, filters);
  
  return (
    <div className="todays-board">
      <BoardFilters filters={filters} onChange={setFilters} />
      <GameGrid games={filteredGames} />
    </div>
  );
}

// GameCard.tsx
function GameCard({ game }: { game: Game }) {
  const r69Progress = calculateR69Progress(game);
  
  return (
    <Card>
      <StatusBadge status={game.status} />
      <TeamScores game={game} />
      <R69ProgressBar progress={r69Progress} />
      <R69StatusBadge r69Event={game.r69_event} status={game.status} />
    </Card>
  );
}
```

### 3. Leaderboards

**Purpose**: Aggregate statistics across teams/conferences

```typescript
// Leaderboards.tsx
export function Leaderboards() {
  const [view, setView] = useState<'teams' | 'conferences'>('teams');
  const [split, setSplit] = useState<'all' | 'home' | 'away'>('all');
  
  const { data } = useLeaderboardData(view, split);
  
  return (
    <div className="leaderboards">
      <LeaderboardControls 
        view={view} 
        split={split}
        onViewChange={setView}
        onSplitChange={setSplit}
      />
      <LeaderboardTable data={data} />
    </div>
  );
}
```

### 4. Stat Explorer

**Purpose**: Deep dive into R69 metrics

**Metrics to Display**:
- **R69M**: Average margin when hitting 69
- **T69**: Average time to reach 69
- **P69**: Most common period for R69 events
- **R69D**: Time delta between teams hitting 69
- **Comeback_69L%**: Percentage of blown leads
- **69PaceIndex**: Pace rating normalized to game length
- **R69_LeadDuration**: How long lead was maintained
- **R69_SwingMargin**: Momentum swing after 69
- **Nice%**: Games with exact 69 points
- **The 69 Club**: Teams with R69W% ≥ 69%

### 5. Predictive Analytics

**Purpose**: Live probability calculator

```typescript
// R69Predictor.tsx
export function R69Predictor({ gameId }: { gameId: string }) {
  const prediction = useR69Prediction(gameId);
  
  return (
    <div className="predictor">
      <PredictionBar 
        homeProb={prediction.home_prob}
        awayProb={prediction.away_prob}
      />
      <PaceIndicator pace={prediction.current_pace} />
      <TimeToR69Estimate estimates={prediction.time_estimates} />
    </div>
  );
}
```

**Algorithm**:
```typescript
function calculateR69Probability(game: Game, pbpEvents: PBPEvent[]) {
  const recentPlays = pbpEvents.slice(-10); // Last 10 plays
  const currentPace = calculateScoringVelocity(recentPlays);
  
  const homeScore = game.home_score;
  const awayScore = game.away_score;
  const homePointsNeeded = Math.max(0, 69 - homeScore);
  const awayPointsNeeded = Math.max(0, 69 - awayScore);
  
  const homeTimeEstimate = homePointsNeeded / currentPace.home;
  const awayTimeEstimate = awayPointsNeeded / currentPace.away;
  
  // Factor in current lead
  const leadFactor = (homeScore - awayScore) / 10; // Normalize
  
  const homeProbability = sigmoid(
    (awayTimeEstimate - homeTimeEstimate) / 60 + leadFactor
  );
  
  return {
    home_prob: homeProbability,
    away_prob: 1 - homeProbability,
    current_pace: currentPace,
    time_estimates: {
      home: homeTimeEstimate,
      away: awayTimeEstimate
    }
  };
}
```

---

## 📊 API Endpoints

### Public API

```typescript
// GET /api/games
// Returns list of games with optional filters
GET /api/games?date=2024-03-15&league=mens&status=in_progress

// GET /api/games/:gameId
// Returns detailed game data
GET /api/games/401234567

// GET /api/games/:gameId/pbp
// Returns play-by-play events
GET /api/games/401234567/pbp

// GET /api/games/:gameId/r69
// Returns R69 event data
GET /api/games/401234567/r69

// GET /api/leaderboards/teams
// Returns team leaderboard
GET /api/leaderboards/teams?season=2024&metric=r69w_pct

// GET /api/leaderboards/conferences
// Returns conference aggregate stats
GET /api/leaderboards/conferences?season=2024

// GET /api/stats/r69-club
// Returns teams in the 69 Club (R69W% ≥ 69%)
GET /api/stats/r69-club

// GET /api/stats/premature-69
// Returns hall of shame
GET /api/stats/premature-69?limit=10

// GET /api/stats/nice-games
// Returns games with nice scores
GET /api/stats/nice-games?type=single

// WebSocket /ws/games/:gameId
// Real-time game updates
```

---

## 🚀 Implementation Phases

### Phase 1: MVP (2-3 weeks)
- [ ] Database schema setup
- [ ] Basic data ingestion pipeline (ESPN API)
- [ ] R69 detection algorithm
- [ ] Simple game tracker UI
- [ ] Today's Board with live updates
- [ ] Basic team statistics

### Phase 2: Analytics (2 weeks)
- [ ] Leaderboards (teams & conferences)
- [ ] Stat Explorer with all R69 metrics
- [ ] Historical data visualization
- [ ] Comparative insights charts

### Phase 3: Advanced Features (2-3 weeks)
- [ ] Predictive analytics
- [ ] R69 Predictor live widget
- [ ] Fun zones (Nice Games, Premature69 Hall of Shame)
- [ ] Advanced filtering and search

### Phase 4: Polish & Scale (1-2 weeks)
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] Social sharing features
- [ ] Historical archives
- [ ] Export/API access

---

## 🧪 Testing Strategy

### Unit Tests
- R69 detection algorithm accuracy
- Statistical calculations
- Data transformation functions

### Integration Tests
- API endpoint responses
- Database queries
- Real-time update flow

### E2E Tests
- Game tracker interactions
- Live update functionality
- Filter and search features

---

## 📈 Analytics & Monitoring

### Key Metrics to Track
- API response times
- Database query performance
- Real-time update latency
- User engagement (page views, interactions)
- R69 detection accuracy

### Monitoring Tools
- Sentry for error tracking
- Vercel Analytics for frontend performance
- Database query monitoring
- Uptime monitoring for data pipelines

---

## 🎯 Success Metrics

**Technical**:
- < 100ms API response time (p95)
- < 15s live update latency
- 99.9% R69 detection accuracy
- < 2s page load time

**Product**:
- Track R69W correlation coefficient over time
- User engagement with different stat categories
- Most viewed teams/conferences
- Share rate of interesting R69 moments

---

## 🔐 Security & Privacy

- Rate limiting on public APIs
- CORS configuration
- Input validation and sanitization
- No PII collection required
- Public data only (NCAA statistics)

---

## 📚 Additional Resources

### Data Sources
- ESPN Hidden API: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard`
- NCAA Stats: `https://stats.ncaa.org`
- Team logos and branding from ESPN CDN

### Recommended Libraries
- **Charts**: Recharts, D3.js, Chart.js
- **Real-time**: Socket.io, Ably, Pusher
- **State**: Zustand, Jotai, React Query
- **UI**: shadcn/ui, Radix UI, Headless UI
- **Utils**: date-fns, lodash, zod

---

## 🎨 Design System

### Color Palette
- Primary: Basketball orange (#FF6B35)
- Secondary: Court green (#4ECDC4)
- Accent: Victory gold (#FFD700)
- R69W Success: #10B981
- Premature69 Warning: #EF4444
- Neutral: Grays (#1F2937 → #F9FAFB)

### Typography
- Headers: Inter Bold
- Body: Inter Regular
- Monospace stats: JetBrains Mono

---

This architecture provides a solid foundation for building R69W. The modular design allows for incremental development while maintaining scalability for future enhancements.
