#!/usr/bin/env python3
"""
Fetch Arkansas Razorbacks games specifically for debugging R69 events
"""

import requests
import psycopg2
import os
from datetime import datetime, timedelta
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))
DATABASE_URL = os.getenv('DATABASE_URL')

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

def fetch_arkansas_schedule(year):
    """Fetch Arkansas schedule for a given year"""
    url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/8/schedule?season={year}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching schedule for {year}: {e}")
        return {}

def fetch_play_by_play(game_id):
    """Fetch play-by-play data for a game"""
    url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={game_id}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('plays', [])
    except Exception as e:
        print(f"  Error fetching PBP: {e}")
        return []

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

def insert_r69_event(cursor, game_db_id, r69_data, team_name, home_score, away_score):
    """Insert R69 event into database"""
    try:
        team_is_home = r69_data.get('team_is_home', False)
        if team_is_home:
            r69w = home_score > away_score
            final_margin = home_score - away_score
        else:
            r69w = away_score > home_score
            final_margin = away_score - home_score

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
        return True, r69w
    except Exception as e:
        print(f"  Error inserting R69 event: {e}")
        return False, False

def main():
    print("=" * 70)
    print("ARKANSAS RAZORBACKS R69 DATA FETCHER")
    print("=" * 70)

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("\n[OK] Connected to database")
    except Exception as e:
        print(f"\n[ERROR] Database connection failed: {e}")
        return

    # Fetch multiple recent seasons
    seasons = [2024, 2023, 2022]  # 2023-24, 2022-23, 2021-22

    total_games = 0
    total_r69 = 0
    total_r69w = 0

    for year in seasons:
        print(f"\nFetching {year}-{str(year+1)[2:]} season...")
        schedule_data = fetch_arkansas_schedule(year)

        events = schedule_data.get('events', [])
        print(f"Found {len(events)} games\n")

        for event in events:
            try:
                game_id = event.get('id')
                name = event.get('name', 'Unknown')
                competition = event.get('competitions', [{}])[0]
                competitors = competition.get('competitors', [])

                # Find Arkansas and opponent
                ark_competitor = next((c for c in competitors if c.get('team', {}).get('id') == '8'), None)
                opp_competitor = next((c for c in competitors if c.get('team', {}).get('id') != '8'), None)

                if not ark_competitor or not opp_competitor:
                    continue

                is_home = ark_competitor.get('homeAway') == 'home'

                # Get scores - handle both int and dict formats
                ark_score_raw = ark_competitor.get('score', 0)
                opp_score_raw = opp_competitor.get('score', 0)
                ark_score = int(ark_score_raw) if not isinstance(ark_score_raw, dict) else int(ark_score_raw.get('value', 0))
                opp_score = int(opp_score_raw) if not isinstance(opp_score_raw, dict) else int(opp_score_raw.get('value', 0))

                opp_name = opp_competitor.get('team', {}).get('displayName', 'Unknown')

                status = event.get('status', {}).get('type', {}).get('name')
                if status != 'STATUS_FINAL':
                    continue

                result = "W" if ark_score > opp_score else "L"
                print(f"  [{result}] vs {opp_name}: {ark_score}-{opp_score}", end="")

                # Check if game exists in DB
                cursor.execute("SELECT id FROM games WHERE game_id = %s", (game_id,))
                game_row = cursor.fetchone()

                if not game_row:
                    print(" - Game not in DB, skipping")
                    continue

                game_db_id = game_row[0]
                total_games += 1

                # Fetch PBP
                plays = fetch_play_by_play(game_id)

                if not plays:
                    print(" - No PBP data")
                    continue

                # Detect R69
                home_team_id = ark_competitor.get('team', {}).get('id') if is_home else opp_competitor.get('team', {}).get('id')
                away_team_id = opp_competitor.get('team', {}).get('id') if is_home else ark_competitor.get('team', {}).get('id')

                r69_event = detect_r69_event(plays, home_team_id, away_team_id)

                if r69_event:
                    team_name = "Arkansas Razorbacks" if r69_event.get('team_is_home') == is_home else opp_name
                    success, r69w = insert_r69_event(cursor, game_db_id, r69_event, team_name,
                                                     ark_score if is_home else opp_score,
                                                     opp_score if is_home else ark_score)
                    if success:
                        total_r69 += 1
                        if r69w:
                            total_r69w += 1
                        r69_result = "R69W" if r69w else "R69L"
                        print(f" - {r69_result} ({team_name} at {r69_event['margin_at_69']:+d})")
                    else:
                        print(" - R69 detected but insert failed")
                else:
                    print(" - No R69 event")

                conn.commit()
                time.sleep(0.5)

            except Exception as e:
                print(f"\n  [ERROR] {name}: {e}")
                continue

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total games processed: {total_games}")
    print(f"Total R69 events: {total_r69}")
    print(f"Total R69W: {total_r69w}")
    print(f"R69W Rate: {(total_r69w / total_r69 * 100) if total_r69 > 0 else 0:.1f}%")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
