#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
R69W Historical Data Fetcher
Fetches historical NCAA basketball game data from ESPN API
"""

import os
import sys
import requests
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time

# Fix Windows console encoding for Unicode characters
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True)
else:
    # Enable line buffering for other platforms too
    sys.stdout.reconfigure(line_buffering=True)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

DATABASE_URL = os.getenv('DATABASE_URL')
ESPN_API_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball"

def fetch_scoreboard(date, league='mens-college-basketball'):
    """Fetch scoreboard for a specific date"""
    date_str = date.strftime("%Y%m%d")
    url = f"{ESPN_API_BASE}/{league}/scoreboard"
    params = {"dates": date_str, "limit": 100}

    try:
        print(f"  Fetching {date_str}...")
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  Error fetching {date_str}: {e}")
        return {"events": []}

def fetch_play_by_play(game_id, league='mens-college-basketball'):
    """Fetch play-by-play for a game"""
    url = f"{ESPN_API_BASE}/{league}/summary"
    params = {"event": game_id}

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"    Error fetching PBP for {game_id}: {e}")
        return {}

def calculate_elapsed_time(period_num, clock_display):
    """Calculate total elapsed time from start of game"""
    # Each half is 20 minutes (1200 seconds)
    # Clock counts down, so remaining time in current period
    remaining_seconds = convert_clock_to_seconds(clock_display)

    # Calculate elapsed time
    if period_num == 1:
        elapsed = 1200 - remaining_seconds
    elif period_num == 2:
        elapsed = 1200 + (1200 - remaining_seconds)
    else:  # Overtime periods (5 min each)
        elapsed = 2400 + ((period_num - 2) * 300) + (300 - remaining_seconds)

    return elapsed

def detect_r69_event(plays, home_team_id, away_team_id):
    """Detect R69 event from play-by-play data - tracks first team to reach 69"""
    home_hit_69 = False
    away_hit_69 = False

    for play in plays:
        home_score = play.get('homeScore', 0)
        away_score = play.get('awayScore', 0)

        # Check if home team hit 69 first (regardless of whether leading)
        if home_score >= 69 and not home_hit_69 and not away_hit_69:
            home_hit_69 = True
            period = play.get('period', {})
            period_num = period.get('number', 1) if isinstance(period, dict) else 1
            clock_display = play.get('clock', {}).get('displayValue', '0:00')
            elapsed_time = calculate_elapsed_time(period_num, clock_display)

            return {
                'team_id': home_team_id,
                'team_is_home': True,
                't_to_69': elapsed_time,
                'period': period_num,
                'margin_at_69': home_score - away_score,
                'opponent_score': away_score,
                'description': play.get('text', '')
            }

        # Check if away team hit 69 first (regardless of whether leading)
        if away_score >= 69 and not away_hit_69 and not home_hit_69:
            away_hit_69 = True
            period = play.get('period', {})
            period_num = period.get('number', 1) if isinstance(period, dict) else 1
            clock_display = play.get('clock', {}).get('displayValue', '0:00')
            elapsed_time = calculate_elapsed_time(period_num, clock_display)

            return {
                'team_id': away_team_id,
                'team_is_home': False,
                't_to_69': elapsed_time,
                'period': period_num,
                'margin_at_69': away_score - home_score,
                'opponent_score': home_score,
                'description': play.get('text', '')
            }

    return None

def insert_game(cursor, game_data, season=None):
    """Insert game into database"""
    try:
        # Determine season based on game date if not provided
        if not season:
            game_date = datetime.strptime(game_data.get('date', ''), '%Y-%m-%dT%H:%M%SZ').date()
            year = game_date.year
            month = game_date.month
            # Basketball seasons run Nov-Apr, so if month is Jan-Apr, season started last year
            # Months: 1=Jan, 2=Feb, 3=Mar, 4=Apr, 5=May, ..., 11=Nov, 12=Dec
            if month <= 4:
                # Jan-Apr: season started in November of previous year
                season = f"{year - 1}-{str(year)[2:]}"
            else:
                # May-Dec: upcoming season (Nov onwards) or off-season
                season = f"{year}-{str(year + 1)[2:]}"

        competition = game_data.get('competitions', [{}])[0]
        competitors = competition.get('competitors', [])

        # Get teams
        home_team = next((c for c in competitors if c.get('homeAway') == 'home'), {})
        away_team = next((c for c in competitors if c.get('homeAway') == 'away'), {})

        game_id = game_data.get('id')
        game_date = datetime.strptime(game_data.get('date', ''), '%Y-%m-%dT%H:%M%SZ').date()

        # Map status
        status_map = {
            'STATUS_SCHEDULED': 'scheduled',
            'STATUS_IN_PROGRESS': 'in_progress',
            'STATUS_FINAL': 'final',
            'STATUS_POSTPONED': 'postponed',
            'STATUS_CANCELED': 'canceled'
        }
        status = status_map.get(game_data.get('status', {}).get('type', {}).get('name'), 'scheduled')

        # Extract team logos
        home_logo = home_team.get('team', {}).get('logo')
        away_logo = away_team.get('team', {}).get('logo')

        # Insert game
        cursor.execute("""
            INSERT INTO games (
                id, game_id, game_date, season, league,
                home_team_id, away_team_id, home_team_name, away_team_name,
                home_conference, away_conference, home_team_logo, away_team_logo,
                venue, game_type,
                home_score, away_score, final_margin,
                game_status, total_periods, overtime_flag,
                created_at, updated_at
            ) VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (game_id) DO UPDATE SET
                home_score = EXCLUDED.home_score,
                away_score = EXCLUDED.away_score,
                final_margin = EXCLUDED.final_margin,
                game_status = EXCLUDED.game_status,
                total_periods = EXCLUDED.total_periods,
                overtime_flag = EXCLUDED.overtime_flag,
                home_team_logo = EXCLUDED.home_team_logo,
                away_team_logo = EXCLUDED.away_team_logo,
                updated_at = NOW()
            RETURNING id
        """, (
            game_id,
            game_date,
            season,
            'mens',
            home_team.get('team', {}).get('id', ''),
            away_team.get('team', {}).get('id', ''),
            home_team.get('team', {}).get('displayName', 'Home'),
            away_team.get('team', {}).get('displayName', 'Away'),
            home_team.get('team', {}).get('conferenceId'),
            away_team.get('team', {}).get('conferenceId'),
            home_logo,
            away_logo,
            competition.get('venue', {}).get('fullName'),
            'regular',
            int(home_team.get('score', 0)),
            int(away_team.get('score', 0)),
            int(home_team.get('score', 0)) - int(away_team.get('score', 0)),
            status,
            2,
            False
        ))

        result = cursor.fetchone()
        return result[0] if result else None

    except Exception as e:
        print(f"    Error inserting game: {e}")
        return None

def fetch_play_by_play(game_id, retries=3):
    """
    Fetch play-by-play data for a game with retry logic for network errors

    Args:
        game_id: ESPN game ID
        retries: Number of retry attempts for server errors (default: 3)

    Returns:
        List of play-by-play events, or empty list on failure
    """
    url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={game_id}"

    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()

            # Extract plays from the playByPlay section
            plays = data.get('plays', [])
            return plays

        except requests.exceptions.Timeout:
            if attempt < retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                print(f"      ⏱ Timeout fetching PBP for game {game_id} (attempt {attempt + 1}/{retries}), retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"      ❌ Timeout fetching PBP for game {game_id} after {retries} attempts")
                return []

        except requests.exceptions.HTTPError as e:
            # Retry on server errors (502, 503, 504)
            if e.response.status_code in [502, 503, 504]:
                if attempt < retries - 1:
                    wait_time = 2 ** attempt
                    print(f"      ⚠ {e.response.status_code} Server Error for game {game_id} (attempt {attempt + 1}/{retries}), retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"      ❌ {e.response.status_code} Server Error for game {game_id} after {retries} attempts")
                    return []
            else:
                # Don't retry on client errors (404, 400, etc)
                print(f"      ❌ HTTP {e.response.status_code} error fetching PBP for game {game_id}: {e}")
                return []

        except requests.exceptions.RequestException as e:
            print(f"      ❌ Network error fetching PBP for game {game_id}: {e}")
            return []

        except Exception as e:
            print(f"      ❌ Unexpected error fetching PBP for game {game_id}: {e}")
            return []

    return []

def insert_r69_event(cursor, game_db_id, r69_data, game_final_home_score, game_final_away_score):
    """Insert R69 event into database"""
    try:
        # Determine if this was an R69W (won after hitting 69 first)
        team_is_home = r69_data.get('team_is_home', False)
        if team_is_home:
            r69w = game_final_home_score > game_final_away_score
            final_margin = game_final_home_score - game_final_away_score
        else:
            r69w = game_final_away_score > game_final_home_score
            final_margin = game_final_away_score - game_final_home_score

        cursor.execute("""
            INSERT INTO r69_events (
                id, game_id, team_id, team_name,
                t_to_69, period_at_69, margin_at_69,
                score_at_69_team, score_at_69_opponent,
                r69w, final_margin, play_description,
                created_at
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
            )
            ON CONFLICT DO NOTHING
        """, (
            game_db_id,
            r69_data['team_id'],
            r69_data['team_name'],
            r69_data['t_to_69'],
            r69_data['period'],
            r69_data['margin_at_69'],
            69,
            r69_data['opponent_score'],
            r69w,
            final_margin,
            r69_data.get('description', '')
        ))
        return True
    except Exception as e:
        print(f"      Error inserting R69 event: {e}")
        return False

def convert_clock_to_seconds(clock_display):
    """Convert clock display (e.g., '12:34') to seconds"""
    try:
        if not clock_display or clock_display == '0:00':
            return 0
        parts = clock_display.split(':')
        if len(parts) == 2:
            minutes, seconds = parts
            return int(minutes) * 60 + int(seconds)
        return 0
    except:
        return 0

def insert_pbp_events(cursor, game_db_id, plays):
    """Insert play-by-play events into database"""
    try:
        for idx, play in enumerate(plays):
            # Convert clock display to seconds
            clock_display = play.get('clock', {}).get('displayValue', '0:00')
            clock_seconds = convert_clock_to_seconds(clock_display)

            # Get period number
            period = play.get('period', {})
            period_num = period.get('number', 1) if isinstance(period, dict) else 1

            # Calculate elapsed time from start of game
            elapsed_seconds = calculate_elapsed_time(period_num, clock_display)

            # Get points scored
            score_value = play.get('scoreValue', 0)

            # Get home and away scores
            home_score = play.get('homeScore', 0)
            away_score = play.get('awayScore', 0)

            cursor.execute("""
                INSERT INTO pbp_events (
                    id, game_id, sequence_number, period, clock_seconds, elapsed_seconds,
                    team_id, player_name, event_type, points_scored,
                    home_score, away_score, description, created_at
                ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                )
                ON CONFLICT (game_id, sequence_number) DO NOTHING
            """, (
                game_db_id,
                play.get('sequenceNumber', str(idx)),
                period_num,
                clock_seconds,
                elapsed_seconds,
                play.get('team', {}).get('id', ''),
                play.get('participants', [{}])[0].get('athlete', {}).get('displayName', '') if play.get('participants') else '',
                play.get('type', {}).get('text', ''),
                score_value,
                home_score,
                away_score,
                play.get('text', '')
            ))
        return True
    except Exception as e:
        print(f"      Error inserting PBP events: {e}")
        return False

def get_basketball_seasons(num_seasons):
    """Generate list of basketball season date ranges (oldest to newest)"""
    seasons = []
    current_year = datetime.now().year
    current_month = datetime.now().month

    # Determine the most recent completed/current season
    # Basketball season runs Oct (month 10) through April (month 4)
    if current_month >= 10:
        latest_season_start_year = current_year
    else:
        latest_season_start_year = current_year - 1

    # Generate seasons from oldest to newest (reverse order)
    for i in range(num_seasons - 1, -1, -1):
        season_start_year = latest_season_start_year - i

        # Season starts November 1 (early games start in October but Nov 1 is safer)
        season_start = datetime(season_start_year, 11, 1)

        # Season ends April 10 (after NCAA tournament, which ends early April)
        season_end = datetime(season_start_year + 1, 4, 10)

        # If this is the current season and we haven't reached the end yet, use today
        if i == 0 and datetime.now() < season_end:
            season_end = datetime.now()

        seasons.append({
            'start': season_start,
            'end': season_end,
            'label': f"{season_start_year}-{str(season_start_year + 1)[2:]}"
        })

    return seasons

def get_specific_season(season_label):
    """Get date range for a specific season (e.g., '2015-16')"""
    try:
        parts = season_label.split('-')
        if len(parts) != 2:
            return None

        start_year = int(parts[0])
        end_year_suffix = parts[1]

        # Handle 2-digit year suffix
        if len(end_year_suffix) == 2:
            end_year = 2000 + int(end_year_suffix)
        else:
            end_year = int(end_year_suffix)

        # Validate that end_year is start_year + 1
        if end_year != start_year + 1:
            return None

        # Season starts November 1
        season_start = datetime(start_year, 11, 1)

        # Season ends April 10
        season_end = datetime(end_year, 4, 10)

        # If this is a future season, return None
        if season_start > datetime.now():
            return None

        # If this is the current season and we haven't reached the end yet, use today
        if season_end > datetime.now():
            season_end = datetime.now()

        return {
            'start': season_start,
            'end': season_end,
            'label': season_label
        }
    except Exception as e:
        print(f"Error parsing season: {e}")
        return None

def check_game_exists(cursor, espn_game_id):
    """Check if a game already exists in the database"""
    try:
        cursor.execute("SELECT id FROM games WHERE game_id = %s", (espn_game_id,))
        result = cursor.fetchone()
        return result is not None
    except Exception as e:
        print(f"Error checking game existence: {e}")
        return False

def check_pbp_exists(cursor, game_db_id):
    """Check if play-by-play data exists for a game"""
    try:
        cursor.execute("SELECT COUNT(*) FROM pbp_events WHERE game_id = %s", (game_db_id,))
        result = cursor.fetchone()
        return result[0] > 0 if result else False
    except Exception as e:
        print(f"Error checking PBP existence: {e}")
        return False

def main():
    """Main execution"""
    print("\n" + "=" * 80)
    print("🏀 R69W HISTORICAL DATA FETCHER")
    print("=" * 80)
    print("\nFetches NCAA basketball game data from ESPN API")
    print("=" * 80)

    # Get date range from command line or user input
    use_season_dates = False
    seasons_to_fetch = []
    days_back = 7

    # Check for command-line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ['--seasons', '-s'] and len(sys.argv) > 2:
            # Fetch N seasons: python fetch_historical_data.py --seasons 5
            try:
                num_seasons = int(sys.argv[2])
                if num_seasons < 1 or num_seasons > 20:
                    print("❌ Invalid number of seasons. Using 1 season.")
                    num_seasons = 1
                use_season_dates = True
                seasons_to_fetch = get_basketball_seasons(num_seasons)
                print(f"\n✅ Fetching {num_seasons} season(s) (from command line)")
            except ValueError:
                print("❌ Invalid season count. Using 1 season.")
                use_season_dates = True
                seasons_to_fetch = get_basketball_seasons(1)
        elif arg in ['--days', '-d'] and len(sys.argv) > 2:
            # Fetch N days: python fetch_historical_data.py --days 30
            try:
                days_back = int(sys.argv[2])
                if days_back < 1 or days_back > 365:
                    print("❌ Invalid number of days. Using 7 days.")
                    days_back = 7
                print(f"\n✅ Fetching last {days_back} day(s) (from command line)")
            except ValueError:
                print("❌ Invalid day count. Using 7 days.")
                days_back = 7
        else:
            # Try to interpret as option number for backward compatibility
            try:
                choice = sys.argv[1]
            except:
                choice = '1'
    else:
        # Interactive mode
        print("\nFetch historical data from ESPN API")
        print("\n📅 QUICK OPTIONS:")
        print("  1. Last 7 days (any games)")
        print("  2. Last 30 days (any games)")
        print("  3. Custom number of days (any games)")
        print("\n🏀 SEASON OPTIONS:")
        print("  4. Current season only")
        print("  5. Last 2 seasons")
        print("  6. Last 5 seasons")
        print("  7. Last 10 seasons")
        print("\n🎯 SPECIFIC SEASON:")
        print("  8. Select specific season (2015-16 through current)")
        print("     Examples: 2015-16, 2020-21, 2023-24")

        choice = input("\nSelect option (default: 1): ").strip()

    # Process choice if not already handled by command-line args
    if not use_season_dates and 'choice' in locals():
        if choice == '2':
            days_back = 30
        elif choice == '3':
            custom = input("Enter number of days: ").strip()
            days_back = int(custom) if custom else 7
        elif choice == '4':
            use_season_dates = True
            seasons_to_fetch = get_basketball_seasons(1)
        elif choice == '5':
            use_season_dates = True
            seasons_to_fetch = get_basketball_seasons(2)
        elif choice == '6':
            use_season_dates = True
            seasons_to_fetch = get_basketball_seasons(5)
        elif choice == '7':
            use_season_dates = True
            seasons_to_fetch = get_basketball_seasons(10)
        elif choice == '8':
            # Specific season selection
            print("\nAvailable seasons: 2015-16 through current")
            print("Examples: 2015-16, 2016-17, 2020-21, 2023-24")
            season_input = input("Enter season (e.g., 2015-16): ").strip()

            if season_input:
                season_data = get_specific_season(season_input)
                if season_data:
                    use_season_dates = True
                    seasons_to_fetch = [season_data]
                    print(f"\n✅ Selected season: {season_data['label']}")
                else:
                    print("\n❌ Invalid season format. Using last 7 days instead.")
                    days_back = 7
            else:
                print("\n❌ No season entered. Using last 7 days instead.")
                days_back = 7
        else:
            days_back = 7

    if use_season_dates:
        print(f"\nFetching {len(seasons_to_fetch)} basketball season(s):")
        for season in seasons_to_fetch:
            print(f"  {season['label']}: {season['start'].strftime('%Y-%m-%d')} to {season['end'].strftime('%Y-%m-%d')}")
    else:
        start_date = datetime.now() - timedelta(days=days_back)
        end_date = datetime.now()
        print(f"\nFetching data from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        print(f"Total days: {days_back}")

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("\n✅ Connected to database")
    except Exception as e:
        print(f"\n❌ Database connection failed: {e}")
        return

    # Fetch data
    total_games = 0
    total_cached_games = 0
    total_r69_events = 0
    total_r69w = 0
    total_errors = 0

    print("\n📊 Fetching games...")
    print("─" * 80)
    print("Note: Games already in database will be skipped for optimization")

    # Determine which date ranges to process
    if use_season_dates:
        # Process each basketball season (chronologically: oldest to newest)
        for season in seasons_to_fetch:
            print(f"\n{'='*60}")
            print(f"SEASON: {season['label']}")
            print(f"{'='*60}")

            current_date = season['start']
            season_end = season['end']

            while current_date <= season_end:
                print(f"\n[{current_date.strftime('%Y-%m-%d')}]")

                # Fetch scoreboard
                data = fetch_scoreboard(current_date)
                events = data.get('events', [])

                if not events:
                    print("  No games found")
                    current_date += timedelta(days=1)
                    continue

                print(f"  Found {len(events)} games")

                for event in events:
                    try:
                        game_id = event.get('id')
                        name = event.get('shortName', 'Unknown')

                        # Check if game already exists
                        if check_game_exists(cursor, game_id):
                            print(f"    [CACHED] {name} - already exists, skipping...")
                            total_cached_games += 1
                            continue

                        # Get competition details for final scores
                        competition = event.get('competitions', [{}])[0]
                        competitors = competition.get('competitors', [])
                        home_team = next((c for c in competitors if c.get('homeAway') == 'home'), {})
                        away_team = next((c for c in competitors if c.get('homeAway') == 'away'), {})

                        home_score = int(home_team.get('score', 0))
                        away_score = int(away_team.get('score', 0))
                        home_team_id = home_team.get('team', {}).get('id', '')
                        away_team_id = away_team.get('team', {}).get('id', '')
                        home_team_name = home_team.get('team', {}).get('displayName', 'Home')
                        away_team_name = away_team.get('team', {}).get('displayName', 'Away')

                        # Only process completed games (status is in competition, not event)
                        status = competition.get('status', {}).get('type', {})
                        status_name = status.get('name', 'UNKNOWN')
                        is_completed = status.get('completed', False)
                        if status_name != 'STATUS_FINAL' and not is_completed:
                            print(f"    [SKIP] {name} - not final ({status_name})")
                            continue

                        # Insert game
                        db_game_id = insert_game(cursor, event, season=season['label'])
                        if not db_game_id:
                            continue

                        total_games += 1
                        print(f"    [OK] {name}")

                        # Fetch play-by-play data
                        plays = fetch_play_by_play(game_id)

                        if plays:
                            # Insert PBP events
                            insert_pbp_events(cursor, db_game_id, plays)

                            # Detect R69 event
                            r69_event = detect_r69_event(plays, home_team_id, away_team_id)

                            if r69_event:
                                # Add team name to r69_event
                                if r69_event.get('team_is_home'):
                                    r69_event['team_name'] = home_team_name
                                else:
                                    r69_event['team_name'] = away_team_name

                                # Insert R69 event
                                if insert_r69_event(cursor, db_game_id, r69_event, home_score, away_score):
                                    total_r69_events += 1
                                    team_name = r69_event['team_name']
                                    is_r69w = (r69_event.get('team_is_home') and home_score > away_score) or \
                                              (not r69_event.get('team_is_home') and away_score > home_score)
                                    if is_r69w:
                                        total_r69w += 1
                                    r69w = "W" if is_r69w else "L"
                                    print(f"      🎯 R69{r69w} | {team_name} hit 69 first at {r69_event['margin_at_69']:+d}")

                        # Rate limit
                        time.sleep(0.5)

                    except Exception as e:
                        print(f"    ❌ Error processing game: {e}")
                        total_errors += 1
                        continue

                conn.commit()
                current_date += timedelta(days=1)

                # Rate limit between days
                time.sleep(1)
    else:
        # Process continuous date range
        start_date = datetime.now() - timedelta(days=days_back)
        end_date = datetime.now()
        current_date = start_date

        while current_date <= end_date:
            print(f"\n[{current_date.strftime('%Y-%m-%d')}]")

            # Fetch scoreboard
            data = fetch_scoreboard(current_date)
            events = data.get('events', [])

            if not events:
                print("  No games found")
                current_date += timedelta(days=1)
                continue

            print(f"  Found {len(events)} games")

            for event in events:
                try:
                    game_id = event.get('id')
                    name = event.get('shortName', 'Unknown')

                    # Check if game already exists (optimization)
                    if check_game_exists(cursor, game_id):
                        print(f"    [CACHED] {name} - already exists, skipping...")
                        total_cached_games += 1
                        continue

                    # Get competition details for final scores
                    competition = event.get('competitions', [{}])[0]
                    competitors = competition.get('competitors', [])
                    home_team = next((c for c in competitors if c.get('homeAway') == 'home'), {})
                    away_team = next((c for c in competitors if c.get('homeAway') == 'away'), {})

                    home_score = int(home_team.get('score', 0))
                    away_score = int(away_team.get('score', 0))
                    home_team_id = home_team.get('team', {}).get('id', '')
                    away_team_id = away_team.get('team', {}).get('id', '')
                    home_team_name = home_team.get('team', {}).get('displayName', 'Home')
                    away_team_name = away_team.get('team', {}).get('displayName', 'Away')

                    # Only process completed games (status is in competition, not event)
                    status = competition.get('status', {}).get('type', {})
                    status_name = status.get('name', 'UNKNOWN')
                    is_completed = status.get('completed', False)
                    if status_name != 'STATUS_FINAL' and not is_completed:
                        print(f"    [SKIP] {name} - not final ({status_name})")
                        continue

                    # Insert game
                    db_game_id = insert_game(cursor, event)
                    if not db_game_id:
                        continue

                    total_games += 1
                    print(f"    [OK] {name}")

                    # Fetch play-by-play data
                    plays = fetch_play_by_play(game_id)

                    if plays:
                        # Insert PBP events
                        insert_pbp_events(cursor, db_game_id, plays)

                        # Detect R69 event
                        r69_event = detect_r69_event(plays, home_team_id, away_team_id)

                        if r69_event:
                            # Add team name to r69_event
                            if r69_event.get('team_is_home'):
                                r69_event['team_name'] = home_team_name
                            else:
                                r69_event['team_name'] = away_team_name

                            # Insert R69 event
                            if insert_r69_event(cursor, db_game_id, r69_event, home_score, away_score):
                                total_r69_events += 1
                                team_name = r69_event['team_name']
                                is_r69w = (r69_event.get('team_is_home') and home_score > away_score) or \
                                          (not r69_event.get('team_is_home') and away_score > home_score)
                                if is_r69w:
                                    total_r69w += 1
                                r69w = "W" if is_r69w else "L"
                                print(f"      🎯 R69{r69w} | {team_name} hit 69 first at {r69_event['margin_at_69']:+d}")

                    # Rate limit
                    time.sleep(0.5)

                except Exception as e:
                    print(f"    ❌ Error processing game: {e}")
                    total_errors += 1
                    continue

            conn.commit()
            current_date += timedelta(days=1)

            # Rate limit between days
            time.sleep(1)

    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total games processed (new): {total_games}")
    print(f"Total games skipped (cached): {total_cached_games}")
    print(f"Total games scanned: {total_games + total_cached_games}")
    print(f"Total R69 events detected: {total_r69_events}")
    print(f"Total R69W: {total_r69w}")
    if total_r69_events > 0:
        print(f"R69W Rate: {(total_r69w / total_r69_events * 100):.1f}%")
    print(f"Total errors: {total_errors}")
    print(f"\n⚡ Optimization: Skipped {total_cached_games} existing games")
    print("=" * 80)
    print("\n✅ Data ingestion complete!\n")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
