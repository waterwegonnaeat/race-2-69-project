#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch ONLY Arkansas Razorbacks basketball games from ESPN API
Specialized script for Arkansas-only data collection
"""

import requests
import psycopg2
from psycopg2.extras import execute_values
import os
from datetime import datetime
import time
from dotenv import load_dotenv
import sys

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

ARKANSAS_TEAM_ID = '8'  # ESPN ID for Arkansas Razorbacks

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

def calculate_elapsed_time(period_num, clock_display):
    """Calculate total elapsed time from start of game"""
    remaining_seconds = convert_clock_to_seconds(clock_display)

    if period_num == 1:
        elapsed = 1200 - remaining_seconds
    elif period_num == 2:
        elapsed = 1200 + (1200 - remaining_seconds)
    else:  # Overtime
        elapsed = 2400 + ((period_num - 2) * 300) + (300 - remaining_seconds)

    return elapsed

def fetch_arkansas_schedule(season_year):
    """Fetch Arkansas schedule for a specific season"""
    url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{ARKANSAS_TEAM_ID}/schedule?season={season_year}"
    try:
        print(f"  Fetching schedule from ESPN API...")
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print(f"  ⏱ Timeout fetching schedule for {season_year}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error fetching schedule for {season_year}: {e}")
        return None

def fetch_game_details(game_id, retries=3):
    """Fetch detailed game data with retry logic"""
    url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={game_id}"

    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            if attempt < retries - 1:
                print(f"    ⏱ Timeout (attempt {attempt + 1}/{retries}), retrying...")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"    ❌ Timeout after {retries} attempts")
                return None
        except requests.exceptions.HTTPError as e:
            if e.response.status_code in [502, 503, 504]:
                if attempt < retries - 1:
                    print(f"    ⚠ Server error {e.response.status_code} (attempt {attempt + 1}/{retries}), retrying...")
                    time.sleep(2 ** attempt)
                else:
                    print(f"    ❌ Server error {e.response.status_code} after {retries} attempts")
                    return None
            else:
                print(f"    ❌ HTTP error: {e}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"    ❌ Request error: {e}")
            return None

    return None

def detect_r69_event(plays, home_team_id, away_team_id):
    """
    Detect R69 event from play-by-play data
    Tracks first team to reach 69 points (regardless of leading status)
    """
    home_hit_69 = False
    away_hit_69 = False

    for play in plays:
        home_score = play.get('homeScore', 0)
        away_score = play.get('awayScore', 0)

        # Check if home team hit 69 first
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

        # Check if away team hit 69 first
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

def insert_game(cursor, game_data):
    """Insert game into database"""
    try:
        cursor.execute("""
            INSERT INTO games (
                id, game_id, game_date, season, league,
                home_team_id, home_team_name, home_conference, home_score, home_team_logo,
                away_team_id, away_team_name, away_conference, away_score, away_team_logo,
                final_margin, game_status, game_type, venue,
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                NOW(), NOW()
            )
            ON CONFLICT (game_id) DO UPDATE SET
                home_score = EXCLUDED.home_score,
                away_score = EXCLUDED.away_score,
                final_margin = EXCLUDED.final_margin,
                game_status = EXCLUDED.game_status,
                updated_at = NOW()
            RETURNING id
        """, (
            game_data['game_id'],
            game_data['game_date'],
            game_data['season'],
            game_data['league'],
            game_data['home_team_id'],
            game_data['home_team_name'],
            game_data['home_conference'],
            game_data['home_score'],
            game_data['home_team_logo'],
            game_data['away_team_id'],
            game_data['away_team_name'],
            game_data['away_conference'],
            game_data['away_score'],
            game_data['away_team_logo'],
            game_data['final_margin'],
            game_data['game_status'],
            game_data['game_type'],
            game_data['venue']
        ))
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"    ❌ Error inserting game: {e}")
        return None

def insert_r69_event(cursor, game_db_id, r69_data, team_name, final_home_score, final_away_score):
    """Insert R69 event into database"""
    try:
        team_is_home = r69_data.get('team_is_home', False)
        if team_is_home:
            r69w = final_home_score > final_away_score
            final_margin = final_home_score - final_away_score
        else:
            r69w = final_away_score > final_home_score
            final_margin = final_away_score - final_home_score

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
            RETURNING id
        """, (
            game_db_id,
            r69_data['team_id'],
            team_name,
            r69_data['t_to_69'],
            r69_data['period'],
            r69_data['margin_at_69'],
            69,
            r69_data['opponent_score'],
            r69w,
            final_margin,
            r69_data.get('description', '')
        ))

        result = cursor.fetchone()
        if result:
            return True, r69w
        return False, False
    except Exception as e:
        print(f"    ❌ Error inserting R69 event: {e}")
        return False, False

def get_basketball_seasons(num_seasons):
    """Generate list of basketball season years (oldest to newest)"""
    current_year = datetime.now().year
    current_month = datetime.now().month

    # Basketball season typically starts in November
    # For 2025, we're in the 2024-25 season (which started Nov 2024)
    if current_month >= 7:  # After July, assume new season year
        latest_season_start_year = current_year
    else:
        latest_season_start_year = current_year - 1

    # Generate seasons from oldest to newest
    seasons = []
    for i in range(num_seasons - 1, -1, -1):
        season_start_year = latest_season_start_year - i
        seasons.append(season_start_year)

    return seasons

def main():
    print("\n" + "=" * 80)
    print("🏀 ARKANSAS RAZORBACKS DATA FETCHER")
    print("=" * 80)
    print("\nThis script fetches ONLY Arkansas Razorbacks basketball games")
    print("Team ID: 8 (ESPN)")
    print("\n" + "=" * 80)

    # Show current detected season
    current_year = datetime.now().year
    current_month = datetime.now().month
    detected_season = current_year if current_month >= 7 else current_year - 1
    print(f"\nDetected current season: {detected_season}-{str(detected_season + 1)[2:]}")

    # Get number of seasons from command line arg or prompt
    num_seasons = 5  # Default
    if len(sys.argv) > 1:
        try:
            num_seasons = int(sys.argv[1])
            if num_seasons < 1 or num_seasons > 20:
                print("❌ Invalid number. Using 5 seasons.")
                num_seasons = 5
            print(f"\nFetching {num_seasons} season(s) (from command line argument)")
        except ValueError:
            print("❌ Invalid command line argument. Using 5 seasons.")
            num_seasons = 5
    else:
        # Get number of seasons via prompt
        print("\nHow many seasons would you like to fetch?")
        print("  1 = Current season only")
        print("  3 = Last 3 seasons")
        print("  5 = Last 5 seasons")
        print("  10 = Last 10 seasons")

        try:
            num_seasons_input = input("\nEnter number of seasons (1-20): ").strip()
            num_seasons = int(num_seasons_input)
            if num_seasons < 1 or num_seasons > 20:
                print("❌ Invalid number. Using 5 seasons.")
                num_seasons = 5
        except (ValueError, KeyboardInterrupt):
            print("\n❌ Invalid input. Using 5 seasons.")
            num_seasons = 5

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print(f"\n✅ Connected to database")
    except Exception as e:
        print(f"\n❌ Database connection failed: {e}")
        return

    # Get seasons to fetch
    seasons = get_basketball_seasons(num_seasons)

    print(f"\n📅 Fetching {num_seasons} season(s) for Arkansas Razorbacks:")
    for season in seasons:
        print(f"  • {season}-{str(season + 1)[2:]}")

    # Statistics
    total_games = 0
    total_r69_events = 0
    total_r69w = 0
    total_errors = 0

    # Process each season
    for season_year in seasons:
        season_str = f"{season_year}-{str(season_year + 1)[2:]}"
        print(f"\n{'─' * 80}")
        print(f"📅 Season: {season_str}")
        print(f"{'─' * 80}")

        schedule_data = fetch_arkansas_schedule(season_year)

        if not schedule_data:
            print(f"  ⚠ Skipping season {season_str} due to fetch error")
            total_errors += 1
            continue

        events = schedule_data.get('events', [])
        print(f"  Found {len(events)} games\n")

        for idx, event in enumerate(events, 1):
            try:
                game_id = event.get('id')
                competition = event.get('competitions', [{}])[0]
                competitors = competition.get('competitors', [])

                # Find Arkansas and opponent
                ark_competitor = next((c for c in competitors if c.get('team', {}).get('id') == ARKANSAS_TEAM_ID), None)
                opp_competitor = next((c for c in competitors if c.get('team', {}).get('id') != ARKANSAS_TEAM_ID), None)

                if not ark_competitor or not opp_competitor:
                    print(f"  [{idx}/{len(events)}] ⚠ Skipping - missing team data")
                    continue

                # Game status (status is in the competition, not event)
                status = competition.get('status', {}).get('type', {})
                status_name = status.get('name', 'UNKNOWN')
                status_detail = status.get('detail', 'Unknown')

                # Team info
                is_home = ark_competitor.get('homeAway') == 'home'
                opp_name = opp_competitor.get('team', {}).get('displayName', 'Unknown')

                # Scores
                ark_score_raw = ark_competitor.get('score', 0)
                opp_score_raw = opp_competitor.get('score', 0)
                ark_score = int(ark_score_raw) if not isinstance(ark_score_raw, dict) else int(ark_score_raw.get('value', 0))
                opp_score = int(opp_score_raw) if not isinstance(opp_score_raw, dict) else int(opp_score_raw.get('value', 0))

                # Display game info
                location = "(H)" if is_home else "(A)"

                # Check if game is completed (handle various final status names)
                is_final = status_name in ['STATUS_FINAL', 'FINAL']
                is_completed = status.get('completed', False)

                if is_final or is_completed:
                    result = "W" if ark_score > opp_score else "L"
                    print(f"  [{idx}/{len(events)}] {location} {result} vs {opp_name}: {ark_score}-{opp_score}", end="")
                else:
                    print(f"  [{idx}/{len(events)}] {location} vs {opp_name}: {status_detail} [{status_name}]", end="")

                # Only process final games
                if not (is_final or is_completed):
                    print(" - Skipping (not final)")
                    continue

                # Fetch game details
                game_details = fetch_game_details(game_id)

                if not game_details:
                    print(" - ❌ Failed to fetch details")
                    total_errors += 1
                    continue

                # Extract game data
                header = game_details.get('header', {})
                competition = game_details.get('boxscore', {}).get('teams', [])

                # Build game data
                home_competitor = ark_competitor if is_home else opp_competitor
                away_competitor = opp_competitor if is_home else ark_competitor

                # Map game type to enum value
                season_type = header.get('season', {}).get('type', 2)
                game_type_map = {1: 'tournament', 2: 'regular', 3: 'tournament'}
                game_type = game_type_map.get(season_type, 'regular')

                game_data = {
                    'game_id': game_id,
                    'game_date': header.get('competitions', [{}])[0].get('date', datetime.now().isoformat()),
                    'season': season_str,
                    'league': 'mens',  # Lowercase to match Prisma enum
                    'home_team_id': home_competitor.get('team', {}).get('id', ''),
                    'home_team_name': home_competitor.get('team', {}).get('displayName', ''),
                    'home_conference': home_competitor.get('team', {}).get('conferenceId', None),
                    'home_score': ark_score if is_home else opp_score,
                    'home_team_logo': home_competitor.get('team', {}).get('logo', ''),
                    'away_team_id': away_competitor.get('team', {}).get('id', ''),
                    'away_team_name': away_competitor.get('team', {}).get('displayName', ''),
                    'away_conference': away_competitor.get('team', {}).get('conferenceId', None),
                    'away_score': opp_score if is_home else ark_score,
                    'away_team_logo': away_competitor.get('team', {}).get('logo', ''),
                    'final_margin': abs(ark_score - opp_score),
                    'game_status': 'final',  # Lowercase to match Prisma enum
                    'game_type': game_type,
                    'venue': header.get('competitions', [{}])[0].get('venue', {}).get('fullName', '')
                }

                # Insert game
                game_db_id = insert_game(cursor, game_data)

                if not game_db_id:
                    print(" - ❌ Failed to insert game")
                    total_errors += 1
                    continue

                total_games += 1

                # Fetch play-by-play for R69 detection
                plays = game_details.get('plays', [])

                if not plays:
                    print(" - No PBP data")
                    conn.commit()
                    continue

                # Detect R69 event
                home_team_id = home_competitor.get('team', {}).get('id')
                away_team_id = away_competitor.get('team', {}).get('id')

                r69_event = detect_r69_event(plays, home_team_id, away_team_id)

                if r69_event:
                    # Determine team name that hit 69
                    if r69_event.get('team_is_home'):
                        team_name = game_data['home_team_name']
                    else:
                        team_name = game_data['away_team_name']

                    success, r69w = insert_r69_event(
                        cursor, game_db_id, r69_event, team_name,
                        game_data['home_score'], game_data['away_score']
                    )

                    if success:
                        total_r69_events += 1
                        if r69w:
                            total_r69w += 1
                        r69_result = "R69W" if r69w else "R69L"
                        print(f" - 🎯 {r69_result} ({team_name} at {r69_event['margin_at_69']:+d})")
                    else:
                        print(" - ⚠ R69 detected but insert failed")
                else:
                    print(" - No R69")

                conn.commit()
                time.sleep(0.5)  # Rate limiting

            except Exception as e:
                print(f"\n    ❌ Error processing game: {e}")
                total_errors += 1
                conn.rollback()
                continue

    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total games processed: {total_games}")
    print(f"Total R69 events: {total_r69_events}")
    print(f"Total R69W: {total_r69w}")
    if total_r69_events > 0:
        print(f"R69W Rate: {(total_r69w / total_r69_events * 100):.1f}%")
    print(f"Total errors: {total_errors}")
    print("=" * 80 + "\n")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
