"""
R69W Data Ingestion Pipeline
Fetches NCAA basketball game data from ESPN API and processes R69 events
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import time
import os
from dataclasses import dataclass
from enum import Enum


class League(Enum):
    MENS = "mens"
    WOMENS = "womens"


class GameStatus(Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    FINAL = "final"


@dataclass
class R69Event:
    """Represents a Race-to-69 event"""
    team_id: str
    team_name: str
    t_to_69: int  # seconds elapsed
    period_at_69: int
    margin_at_69: int
    score_at_69_opponent: int
    play_description: str
    r69w: Optional[bool] = None
    final_margin: Optional[int] = None


class ESPNAPIClient:
    """Client for fetching data from ESPN's hidden API"""
    
    BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball"
    
    def __init__(self, league: League = League.MENS):
        self.league = league
        self.league_path = "mens-college-basketball" if league == League.MENS else "womens-college-basketball"
    
    def get_scoreboard(self, date: Optional[datetime] = None) -> Dict:
        """
        Fetch scoreboard for a given date
        
        Args:
            date: Date to fetch (defaults to today)
            
        Returns:
            JSON response with game data
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime("%Y%m%d")
        url = f"{self.BASE_URL}/{self.league_path}/scoreboard"
        
        params = {
            "dates": date_str,
            "limit": 100
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching scoreboard: {e}")
            return {"events": []}
    
    def get_play_by_play(self, game_id: str) -> Dict:
        """
        Fetch play-by-play data for a specific game
        
        Args:
            game_id: ESPN game ID
            
        Returns:
            JSON response with play-by-play data
        """
        url = f"{self.BASE_URL}/{self.league_path}/summary"
        params = {"event": game_id}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data
        except requests.exceptions.RequestException as e:
            print(f"Error fetching play-by-play for game {game_id}: {e}")
            return {}


class R69Detector:
    """Detects Race-to-69 events from play-by-play data"""
    
    @staticmethod
    def convert_clock_to_seconds(clock: str, period: int, regulation_period_length: int = 1200) -> int:
        """
        Convert game clock to elapsed seconds
        
        Args:
            clock: Clock string (e.g., "12:30")
            period: Period number (1, 2, or OT)
            regulation_period_length: Length of regulation period in seconds (20 min = 1200s)
            
        Returns:
            Total elapsed seconds from start of game
        """
        try:
            parts = clock.split(":")
            minutes = int(parts[0])
            seconds = int(parts[1])
            remaining_in_period = minutes * 60 + seconds
            
            # Calculate elapsed time
            if period == 1:
                elapsed = regulation_period_length - remaining_in_period
            elif period == 2:
                elapsed = regulation_period_length + (regulation_period_length - remaining_in_period)
            else:  # Overtime (5 min periods)
                ot_number = period - 2
                elapsed = (regulation_period_length * 2) + (ot_number * 300) + (300 - remaining_in_period)
            
            return max(0, elapsed)
        except (ValueError, IndexError):
            return 0
    
    @staticmethod
    def detect_r69_event(plays: List[Dict], home_team_id: str, away_team_id: str) -> Optional[R69Event]:
        """
        Detect when a team first reaches 69 points while leading
        
        Args:
            plays: List of play-by-play events
            home_team_id: Home team ID
            away_team_id: Away team ID
            
        Returns:
            R69Event if detected, None otherwise
        """
        if not plays:
            return None
        
        r69_triggered = False
        
        for i, play in enumerate(plays):
            # Extract scores from play
            home_score = play.get("homeScore", 0)
            away_score = play.get("awayScore", 0)
            
            # Check if home team hit 69 first while leading
            if home_score >= 69 and away_score < 69 and home_score > away_score and not r69_triggered:
                elapsed = R69Detector.convert_clock_to_seconds(
                    play.get("clock", {}).get("displayValue", "0:00"),
                    play.get("period", {}).get("number", 1)
                )
                
                r69_event = R69Event(
                    team_id=home_team_id,
                    team_name=play.get("homeTeamName", "Home Team"),
                    t_to_69=elapsed,
                    period_at_69=play.get("period", {}).get("number", 1),
                    margin_at_69=home_score - away_score,
                    score_at_69_opponent=away_score,
                    play_description=play.get("text", "")
                )
                return r69_event
            
            # Check if away team hit 69 first while leading
            if away_score >= 69 and home_score < 69 and away_score > home_score and not r69_triggered:
                elapsed = R69Detector.convert_clock_to_seconds(
                    play.get("clock", {}).get("displayValue", "0:00"),
                    play.get("period", {}).get("number", 1)
                )
                
                r69_event = R69Event(
                    team_id=away_team_id,
                    team_name=play.get("awayTeamName", "Away Team"),
                    t_to_69=elapsed,
                    period_at_69=play.get("period", {}).get("number", 1),
                    margin_at_69=away_score - home_score,
                    score_at_69_opponent=home_score,
                    play_description=play.get("text", "")
                )
                return r69_event
        
        return None


class GameProcessor:
    """Processes raw game data into structured format"""
    
    def __init__(self, api_client: ESPNAPIClient):
        self.api_client = api_client
        self.detector = R69Detector()
    
    def process_game(self, game_data: Dict) -> Dict:
        """
        Process a single game's data
        
        Args:
            game_data: Raw game data from ESPN API
            
        Returns:
            Processed game data ready for database insertion
        """
        competition = game_data.get("competitions", [{}])[0]
        competitors = competition.get("competitors", [])
        
        # Extract team data
        home_team = next((c for c in competitors if c.get("homeAway") == "home"), {})
        away_team = next((c for c in competitors if c.get("homeAway") == "away"), {})
        
        game_id = game_data.get("id")
        status = game_data.get("status", {})
        
        processed_game = {
            "game_id": game_id,
            "game_date": datetime.fromisoformat(game_data.get("date", "").replace("Z", "+00:00")),
            "season": game_data.get("season", {}).get("year"),
            "league": self.api_client.league.value,
            
            "home_team_id": home_team.get("id"),
            "away_team_id": away_team.get("id"),
            "home_team_name": home_team.get("team", {}).get("displayName"),
            "away_team_name": away_team.get("team", {}).get("displayName"),
            "home_conference": home_team.get("team", {}).get("conferenceId"),
            "away_conference": away_team.get("team", {}).get("conferenceId"),
            
            "venue": competition.get("venue", {}).get("fullName"),
            "game_type": self._determine_game_type(game_data),
            
            "home_score": int(home_team.get("score", 0)),
            "away_score": int(away_team.get("score", 0)),
            "final_margin": abs(int(home_team.get("score", 0)) - int(away_team.get("score", 0))),
            
            "game_status": self._map_game_status(status.get("type", {}).get("name")),
            "overtime_flag": status.get("period", 2) > 2,
            "total_periods": status.get("period", 2)
        }
        
        return processed_game
    
    def process_play_by_play(self, game_id: str) -> Tuple[List[Dict], Optional[R69Event]]:
        """
        Process play-by-play data and detect R69 event
        
        Args:
            game_id: ESPN game ID
            
        Returns:
            Tuple of (processed_plays, r69_event)
        """
        pbp_data = self.api_client.get_play_by_play(game_id)
        
        if not pbp_data:
            return [], None
        
        plays = []
        all_plays_raw = []
        
        # Extract plays from all drives
        for drive in pbp_data.get("drives", {}).get("previous", []):
            for play in drive.get("plays", []):
                all_plays_raw.append(play)
        
        # Current drive
        current_drive = pbp_data.get("drives", {}).get("current", {})
        for play in current_drive.get("plays", []):
            all_plays_raw.append(play)
        
        # Process each play
        for i, play in enumerate(all_plays_raw):
            processed_play = {
                "sequence_number": i,
                "period": play.get("period", {}).get("number", 1),
                "clock_seconds": self._parse_clock(play.get("clock", {}).get("displayValue", "0:00")),
                "elapsed_seconds": R69Detector.convert_clock_to_seconds(
                    play.get("clock", {}).get("displayValue", "0:00"),
                    play.get("period", {}).get("number", 1)
                ),
                "team_id": play.get("team", {}).get("id"),
                "player_name": self._extract_player_name(play),
                "event_type": play.get("type", {}).get("text", "unknown"),
                "points_scored": self._extract_points(play),
                "home_score": play.get("homeScore", 0),
                "away_score": play.get("awayScore", 0),
                "description": play.get("text", "")
            }
            plays.append(processed_play)
        
        # Detect R69 event
        header = pbp_data.get("header", {})
        competitions = header.get("competitions", [{}])[0]
        competitors = competitions.get("competitors", [])
        
        home_team = next((c for c in competitors if c.get("homeAway") == "home"), {})
        away_team = next((c for c in competitors if c.get("homeAway") == "away"), {})
        
        r69_event = self.detector.detect_r69_event(
            all_plays_raw,
            home_team.get("id"),
            away_team.get("id")
        )
        
        return plays, r69_event
    
    def _determine_game_type(self, game_data: Dict) -> str:
        """Determine if game is regular season, conference, or tournament"""
        competition = game_data.get("competitions", [{}])[0]
        notes = competition.get("notes", [])
        
        for note in notes:
            note_text = note.get("headline", "").lower()
            if "tournament" in note_text or "championship" in note_text:
                return "tournament"
            if "conference" in note_text:
                return "conference"
        
        return "regular"
    
    def _map_game_status(self, status_name: str) -> str:
        """Map ESPN status to our GameStatus enum"""
        status_map = {
            "STATUS_SCHEDULED": "scheduled",
            "STATUS_IN_PROGRESS": "in_progress",
            "STATUS_FINAL": "final",
            "STATUS_POSTPONED": "postponed",
            "STATUS_CANCELED": "canceled"
        }
        return status_map.get(status_name, "scheduled")
    
    def _parse_clock(self, clock_str: str) -> int:
        """Parse clock string to seconds remaining"""
        try:
            parts = clock_str.split(":")
            minutes = int(parts[0])
            seconds = int(parts[1])
            return minutes * 60 + seconds
        except (ValueError, IndexError):
            return 0
    
    def _extract_player_name(self, play: Dict) -> Optional[str]:
        """Extract player name from play"""
        athletes = play.get("athletesInvolved", [])
        if athletes:
            return athletes[0].get("displayName")
        return None
    
    def _extract_points(self, play: Dict) -> int:
        """Extract points scored from play"""
        score_value = play.get("scoreValue", 0)
        return score_value if score_value else 0


def main():
    """Main pipeline execution"""
    print("🏀 R69W Data Ingestion Pipeline Started")
    print("=" * 50)
    
    # Initialize clients
    mens_client = ESPNAPIClient(League.MENS)
    womens_client = ESPNAPIClient(League.WOMENS)
    
    mens_processor = GameProcessor(mens_client)
    womens_processor = GameProcessor(womens_client)
    
    # Fetch today's games
    today = datetime.now()
    print(f"\n📅 Fetching games for {today.strftime('%Y-%m-%d')}")
    
    # Men's games
    print("\n👨 Processing Men's Basketball...")
    mens_scoreboard = mens_client.get_scoreboard(today)
    mens_games = mens_scoreboard.get("events", [])
    print(f"Found {len(mens_games)} men's games")
    
    for game in mens_games[:3]:  # Process first 3 games as example
        game_data = mens_processor.process_game(game)
        print(f"\n  Game: {game_data['away_team_name']} @ {game_data['home_team_name']}")
        print(f"  Status: {game_data['game_status']}")
        print(f"  Score: {game_data['away_score']} - {game_data['home_score']}")
        
        # Process play-by-play if game is in progress or final
        if game_data['game_status'] in ['in_progress', 'final']:
            plays, r69_event = mens_processor.process_play_by_play(game_data['game_id'])
            print(f"  Plays processed: {len(plays)}")
            
            if r69_event:
                print(f"\n  🎯 R69 EVENT DETECTED!")
                print(f"     Team: {r69_event.team_name}")
                print(f"     Time to 69: {r69_event.t_to_69}s ({r69_event.t_to_69 // 60}:{r69_event.t_to_69 % 60:02d})")
                print(f"     Period: {r69_event.period_at_69}")
                print(f"     Margin: +{r69_event.margin_at_69}")
                print(f"     Play: {r69_event.play_description[:80]}...")
        
        time.sleep(1)  # Rate limiting
    
    print("\n" + "=" * 50)
    print("✅ Pipeline execution completed")


if __name__ == "__main__":
    main()
