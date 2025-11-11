# R69W API Examples & Integration Guide

Complete reference for API endpoints, request/response formats, and integration patterns.

---

## 🔑 Base URL

```
Production: https://r69w.app/api
Development: http://localhost:3000/api
```

---

## 📋 Table of Contents

1. [Games API](#games-api)
2. [Leaderboards API](#leaderboards-api)
3. [Statistics API](#statistics-api)
4. [Real-time Updates](#real-time-updates)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)

---

## Games API

### Get All Games

Retrieve a list of games with optional filters.

**Endpoint**: `GET /api/games`

**Query Parameters**:
```typescript
{
  date?: string;        // Format: YYYY-MM-DD
  league?: 'mens' | 'womens';
  status?: 'scheduled' | 'in_progress' | 'final';
  conference?: string;
  teamId?: string;
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 20, Max: 100
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/games?date=2024-03-15&league=mens&status=final"
```

**Example Response**:
```json
{
  "games": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "gameId": "401234567",
      "gameDate": "2024-03-15T19:00:00Z",
      "season": "2024",
      "league": "mens",
      "homeTeamId": "150",
      "awayTeamId": "153",
      "homeTeamName": "Duke Blue Devils",
      "awayTeamName": "North Carolina Tar Heels",
      "homeConference": "ACC",
      "awayConference": "ACC",
      "venue": "Cameron Indoor Stadium",
      "gameType": "conference",
      "homeScore": 84,
      "awayScore": 79,
      "finalMargin": 5,
      "gameStatus": "final",
      "totalPeriods": 2,
      "overtimeFlag": false,
      "r69Event": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "teamId": "150",
        "teamName": "Duke Blue Devils",
        "tTo69": 1380,
        "periodAt69": 2,
        "marginAt69": 7,
        "scoreAt69Team": 69,
        "scoreAt69Opponent": 62,
        "r69w": true,
        "finalMargin": 5,
        "playDescription": "Kyle Filipowski makes layup"
      },
      "analytics": {
        "r69PaceIndex": 0.5125,
        "r69LeadDuration": 1020,
        "r69SwingMargin": 2,
        "comeback69L": false,
        "niceScore": false,
        "doubleNice": false
      }
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

### Get Single Game

Get detailed information for a specific game.

**Endpoint**: `GET /api/games/:gameId`

**Example Request**:
```bash
curl "https://r69w.app/api/games/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response**:
```json
{
  "game": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "gameId": "401234567",
    "gameDate": "2024-03-15T19:00:00Z",
    "homeTeamName": "Duke Blue Devils",
    "awayTeamName": "North Carolina Tar Heels",
    "homeScore": 84,
    "awayScore": 79,
    "gameStatus": "final",
    "r69Event": { /* ... */ },
    "analytics": { /* ... */ }
  }
}
```

### Get Play-by-Play

Retrieve play-by-play events for a game.

**Endpoint**: `GET /api/games/:gameId/pbp`

**Query Parameters**:
```typescript
{
  period?: number;      // Filter by period
  startTime?: number;   // Filter events after this time (seconds)
  endTime?: number;     // Filter events before this time (seconds)
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/games/550e8400-e29b-41d4-a716-446655440000/pbp?period=2"
```

**Example Response**:
```json
{
  "plays": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "sequenceNumber": 145,
      "period": 2,
      "clockSeconds": 720,
      "elapsedSeconds": 1380,
      "teamId": "150",
      "playerName": "Kyle Filipowski",
      "eventType": "shot_made",
      "pointsScored": 2,
      "homeScore": 69,
      "awayScore": 62,
      "description": "Kyle Filipowski makes layup (assisted by Jeremy Roach)"
    }
  ],
  "total": 178
}
```

### Get R69 Event

Get the R69 event details for a specific game.

**Endpoint**: `GET /api/games/:gameId/r69`

**Example Request**:
```bash
curl "https://r69w.app/api/games/550e8400-e29b-41d4-a716-446655440000/r69"
```

**Example Response**:
```json
{
  "r69Event": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "150",
    "teamName": "Duke Blue Devils",
    "tTo69": 1380,
    "periodAt69": 2,
    "marginAt69": 7,
    "scoreAt69Team": 69,
    "scoreAt69Opponent": 62,
    "r69w": true,
    "finalMargin": 5,
    "playDescription": "Kyle Filipowski makes layup"
  }
}
```

---

## Leaderboards API

### Team Leaderboard

Get team rankings by R69W performance.

**Endpoint**: `GET /api/leaderboards/teams`

**Query Parameters**:
```typescript
{
  season?: string;      // Default: current season
  league?: 'mens' | 'womens';
  conference?: string;
  metric?: 'r69w_pct' | 't_to_69' | 'margin_at_69';
  minGames?: number;    // Minimum games played
  limit?: number;       // Default: 50
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/leaderboards/teams?season=2024&metric=r69w_pct&minGames=5"
```

**Example Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "teamId": "150",
      "teamName": "Duke Blue Devils",
      "conference": "ACC",
      "league": "mens",
      "gamesPlayed": 28,
      "r69Wins": 22,
      "r69Losses": 6,
      "r69WinPct": 0.7857,
      "avgTTo69": 1320.5,
      "avgMarginAt69": 6.8
    },
    {
      "rank": 2,
      "teamId": "2509",
      "teamName": "UConn Huskies",
      "conference": "Big East",
      "league": "mens",
      "gamesPlayed": 30,
      "r69Wins": 23,
      "r69Losses": 7,
      "r69WinPct": 0.7667,
      "avgTTo69": 1285.2,
      "avgMarginAt69": 7.3
    }
  ],
  "total": 358
}
```

### Conference Leaderboard

Get conference-level R69W statistics.

**Endpoint**: `GET /api/leaderboards/conferences`

**Query Parameters**:
```typescript
{
  season?: string;
  league?: 'mens' | 'womens';
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/leaderboards/conferences?season=2024&league=mens"
```

**Example Response**:
```json
{
  "leaderboard": [
    {
      "conference": "Big 12",
      "league": "mens",
      "season": "2024",
      "teamsCount": 14,
      "totalGames": 392,
      "totalR69Wins": 287,
      "conferenceR69WPct": 0.7321,
      "avgTTo69": 1310.5,
      "avgMarginAt69": 6.9
    }
  ]
}
```

---

## Statistics API

### The 69 Club

Teams with R69W percentage ≥ 69%.

**Endpoint**: `GET /api/stats/69-club`

**Query Parameters**:
```typescript
{
  season?: string;
  league?: 'mens' | 'womens';
  minGames?: number;    // Default: 5
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/stats/69-club?season=2024&minGames=10"
```

**Example Response**:
```json
{
  "club": [
    {
      "teamId": "150",
      "teamName": "Duke Blue Devils",
      "conference": "ACC",
      "league": "mens",
      "r69Attempts": 28,
      "r69Wins": 22,
      "r69WinPct": 78.57
    }
  ]
}
```

### Nice Games

Games where teams scored exactly 69 or both scored 69+.

**Endpoint**: `GET /api/stats/nice-games`

**Query Parameters**:
```typescript
{
  type?: 'single' | 'double' | 'all';  // Default: 'all'
  season?: string;
  league?: 'mens' | 'womens';
  limit?: number;       // Default: 20
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/stats/nice-games?type=double&limit=10"
```

**Example Response**:
```json
{
  "niceGames": [
    {
      "game": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "gameDate": "2024-02-20T20:00:00Z",
        "homeTeamName": "Kansas Jayhawks",
        "awayTeamName": "Texas Longhorns",
        "homeScore": 78,
        "awayScore": 73,
        "gameStatus": "final"
      },
      "niceType": "double",
      "analytics": {
        "doubleNice": true
      }
    }
  ]
}
```

### Premature69 Hall of Shame

Teams that hit 69 first but lost the game.

**Endpoint**: `GET /api/stats/premature-69`

**Query Parameters**:
```typescript
{
  season?: string;
  league?: 'mens' | 'womens';
  sortBy?: 'margin_blown' | 'game_date';
  limit?: number;       // Default: 20
}
```

**Example Request**:
```bash
curl "https://r69w.app/api/stats/premature-69?sortBy=margin_blown&limit=10"
```

**Example Response**:
```json
{
  "prematureGames": [
    {
      "game": {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "gameDate": "2024-01-15T18:00:00Z",
        "homeTeamName": "Kentucky Wildcats",
        "awayTeamName": "Alabama Crimson Tide",
        "homeScore": 75,
        "awayScore": 82,
        "gameStatus": "final"
      },
      "r69Event": {
        "teamName": "Kentucky Wildcats",
        "tTo69": 1260,
        "marginAt69": 12,
        "r69w": false
      },
      "blowDetails": {
        "maxLead": 14,
        "leadLostAt": 1680,
        "finalMargin": -7
      }
    }
  ]
}
```

### Metric Distributions

Get distributions for specific R69 metrics.

**Endpoint**: `GET /api/stats/distributions/:metric`

**Metrics**: `t_to_69`, `margin_at_69`, `pace_index`, `lead_duration`

**Example Request**:
```bash
curl "https://r69w.app/api/stats/distributions/t_to_69?season=2024"
```

**Example Response**:
```json
{
  "metric": "t_to_69",
  "distribution": [
    {
      "bin": "0-600",
      "count": 24,
      "percentage": 3.2
    },
    {
      "bin": "600-1200",
      "count": 198,
      "percentage": 26.4
    },
    {
      "bin": "1200-1800",
      "count": 412,
      "percentage": 54.9
    },
    {
      "bin": "1800-2400",
      "count": 116,
      "percentage": 15.5
    }
  ],
  "stats": {
    "mean": 1324.6,
    "median": 1310.0,
    "stdDev": 285.3,
    "min": 420,
    "max": 2280
  }
}
```

---

## Real-time Updates

### Server-Sent Events (SSE)

Subscribe to real-time game updates.

**Endpoint**: `GET /api/games/:gameId/stream`

**Example (JavaScript)**:
```javascript
const eventSource = new EventSource(
  'https://r69w.app/api/games/550e8400-e29b-41d4-a716-446655440000/stream'
);

eventSource.onmessage = (event) => {
  const game = JSON.parse(event.data);
  console.log('Game updated:', game);
  
  // Update UI with new game state
  updateGameDisplay(game);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

### WebSocket (Advanced)

For bidirectional communication.

**Endpoint**: `wss://r69w.app/ws`

**Example (JavaScript)**:
```javascript
const ws = new WebSocket('wss://r69w.app/ws');

ws.onopen = () => {
  // Subscribe to specific games
  ws.send(JSON.stringify({
    type: 'subscribe',
    gameIds: ['550e8400-e29b-41d4-a716-446655440000']
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'game_update':
      handleGameUpdate(message.data);
      break;
    case 'r69_event':
      handleR69Event(message.data);
      break;
    case 'score_update':
      handleScoreUpdate(message.data);
      break;
  }
};
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game with ID 550e8400-e29b-41d4-a716-446655440000 not found",
    "details": {
      "gameId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `GAME_NOT_FOUND` | 404 | Game does not exist |
| `INVALID_PARAMETERS` | 400 | Invalid query parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `UNAUTHORIZED` | 401 | Invalid API key (future) |

---

## Rate Limiting

**Public API Limits**:
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1617235200
```

**Example Error Response** (429):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 42 seconds.",
    "retryAfter": 42
  }
}
```

---

## Code Examples

### React Hook for Games

```typescript
import { useState, useEffect } from 'react';

function useGames(date: string, league: string) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          `/api/games?date=${date}&league=${league}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        setGames(data.games);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    
    // Poll every 10 seconds for live games
    const interval = setInterval(fetchGames, 10000);
    return () => clearInterval(interval);
  }, [date, league]);

  return { games, loading, error };
}

// Usage
function TodaysGames() {
  const today = new Date().toISOString().split('T')[0];
  const { games, loading, error } = useGames(today, 'mens');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
```

### Python Client

```python
import requests
from typing import List, Dict, Optional
from datetime import datetime

class R69WClient:
    BASE_URL = "https://r69w.app/api"
    
    def __init__(self, api_key: Optional[str] = None):
        self.session = requests.Session()
        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'
    
    def get_games(
        self,
        date: Optional[str] = None,
        league: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict]:
        """Fetch games with optional filters."""
        params = {}
        if date:
            params['date'] = date
        if league:
            params['league'] = league
        if status:
            params['status'] = status
        
        response = self.session.get(f"{self.BASE_URL}/games", params=params)
        response.raise_for_status()
        return response.json()['games']
    
    def get_game(self, game_id: str) -> Dict:
        """Fetch a single game by ID."""
        response = self.session.get(f"{self.BASE_URL}/games/{game_id}")
        response.raise_for_status()
        return response.json()['game']
    
    def get_leaderboard(
        self,
        season: str = "2024",
        league: str = "mens",
        metric: str = "r69w_pct"
    ) -> List[Dict]:
        """Fetch team leaderboard."""
        params = {
            'season': season,
            'league': league,
            'metric': metric
        }
        response = self.session.get(
            f"{self.BASE_URL}/leaderboards/teams",
            params=params
        )
        response.raise_for_status()
        return response.json()['leaderboard']

# Usage
client = R69WClient()

# Get today's games
today = datetime.now().strftime('%Y-%m-%d')
games = client.get_games(date=today, league='mens')

for game in games:
    print(f"{game['awayTeamName']} @ {game['homeTeamName']}")
    print(f"Score: {game['awayScore']} - {game['homeScore']}")
    if game.get('r69Event'):
        r69 = game['r69Event']
        print(f"R69W: {r69['teamName']} ({'Won' if r69['r69w'] else 'Lost'})")
    print()
```

### Node.js/TypeScript Client

```typescript
import axios, { AxiosInstance } from 'axios';

interface Game {
  id: string;
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  gameStatus: string;
  r69Event?: R69Event;
}

interface R69Event {
  teamName: string;
  tTo69: number;
  marginAt69: number;
  r69w: boolean;
}

class R69WClient {
  private client: AxiosInstance;

  constructor(apiKey?: string) {
    this.client = axios.create({
      baseURL: 'https://r69w.app/api',
      timeout: 10000,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
  }

  async getGames(params?: {
    date?: string;
    league?: string;
    status?: string;
  }): Promise<Game[]> {
    const response = await this.client.get('/games', { params });
    return response.data.games;
  }

  async getGame(gameId: string): Promise<Game> {
    const response = await this.client.get(`/games/${gameId}`);
    return response.data.game;
  }

  async getLeaderboard(params?: {
    season?: string;
    league?: string;
    metric?: string;
  }) {
    const response = await this.client.get('/leaderboards/teams', { params });
    return response.data.leaderboard;
  }
}

// Usage
const client = new R69WClient();

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const games = await client.getGames({ date: today, league: 'mens' });
  
  games.forEach(game => {
    console.log(`${game.awayTeamName} @ ${game.homeTeamName}`);
    console.log(`Score: ${game.awayScore} - ${game.homeScore}`);
    
    if (game.r69Event) {
      const status = game.r69Event.r69w ? '✅ Won' : '❌ Lost';
      console.log(`R69W: ${game.r69Event.teamName} ${status}`);
    }
    console.log();
  });
}

main();
```

---

## Webhooks (Future Feature)

Subscribe to R69 events via webhooks.

**Endpoint**: `POST /api/webhooks`

**Request Body**:
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["r69_event", "game_final"],
  "filters": {
    "league": "mens",
    "conference": "ACC"
  }
}
```

**Webhook Payload**:
```json
{
  "event": "r69_event",
  "timestamp": "2024-03-15T20:30:00Z",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "r69Event": {
      "teamName": "Duke Blue Devils",
      "tTo69": 1380,
      "marginAt69": 7,
      "r69w": null
    }
  }
}
```

---

This API reference provides everything needed to integrate R69W data into external applications. For updates and additional endpoints, check the API documentation at https://r69w.app/docs.
