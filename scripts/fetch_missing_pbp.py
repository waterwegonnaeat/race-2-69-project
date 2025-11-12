#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch Missing Play-by-Play Data
Fetches PBP data for games that don't have it yet
"""

import os
import sys
import requests
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv
import time

# Fix Windows console encoding for Unicode characters
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True)
else:
    sys.stdout.reconfigure(line_buffering=True)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

DATABASE_URL = os.getenv('DATABASE_URL')
ESPN_API_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball"

def get_games_without_pbp(conn, limit=None):
    """Get games that don't have PBP data"""
    cursor = conn.cursor()

    query = """
        SELECT g.id, g.game_id, g.home_team_name, g.away_team_name,
               g.game_date, g.league, g.game_status
        FROM games g
        WHERE NOT EXISTS (
            SELECT 1 FROM pbp_events p WHERE p.game_id = g.id
        )
        AND g.game_status = 'final'
        ORDER BY g.game_date DESC
    """

    if limit:
        query += f" LIMIT {limit}"

    cursor.execute(query)
    games = cursor.fetchall()
    cursor.close()

    return games

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

def convert_clock_to_seconds(clock_str):
    """Convert clock display (MM:SS) to seconds"""
    try:
        if ':' in clock_str:
            parts = clock_str.split(':')
            minutes = int(parts[0])
            seconds = int(parts[1])
            return minutes * 60 + seconds
        return 0
    except:
        return 0

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

def detect_r69_event(plays, home_team_id, away_team_id, home_team_name, away_team_name):
    """Detect R69 event from play-by-play data - tracks first team to reach 69"""
    home_hit_69 = False
    away_hit_69 = False
    r69_events = []

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

            r69_events.append({
                'team_id': home_team_id,
                'team_name': home_team_name,
                't_to_69': elapsed_time,
                'period': period_num,
                'margin_at_69': home_score - away_score,
                'opponent_score': away_score,
                'description': play.get('text', '')
            })

        # Check if away team hit 69 first
        if away_score >= 69 and not away_hit_69 and not home_hit_69:
            away_hit_69 = True
            period = play.get('period', {})
            period_num = period.get('number', 1) if isinstance(period, dict) else 1
            clock_display = play.get('clock', {}).get('displayValue', '0:00')
            elapsed_time = calculate_elapsed_time(period_num, clock_display)

            r69_events.append({
                'team_id': away_team_id,
                'team_name': away_team_name,
                't_to_69': elapsed_time,
                'period': period_num,
                'margin_at_69': away_score - home_score,
                'opponent_score': home_score,
                'description': play.get('text', '')
            })

    return r69_events

def save_pbp_events(conn, db_game_id, plays):
    """Save play-by-play events to database"""
    cursor = conn.cursor()

    pbp_data = []
    for i, play in enumerate(plays):
        period = play.get('period', {})
        period_num = period.get('number', 1) if isinstance(period, dict) else 1
        clock_display = play.get('clock', {}).get('displayValue', '0:00')
        clock_seconds = convert_clock_to_seconds(clock_display)
        elapsed_seconds = calculate_elapsed_time(period_num, clock_display)

        # Extract team and player info
        team_id = play.get('team', {}).get('id', None) if play.get('team') else None

        # Get scoring team for shots
        scoring_team_id = None
        points_scored = 0
        event_type = play.get('type', {}).get('text', 'unknown')

        if play.get('scoringPlay', False):
            scoring_team_id = team_id
            # Try to determine points from score value
            score_value = play.get('scoreValue', 0)
            points_scored = score_value if score_value else 0

        pbp_data.append((
            db_game_id,
            i,  # sequence_number
            period_num,
            clock_seconds,
            elapsed_seconds,
            team_id,
            None,  # player_name - not always available
            event_type,
            points_scored,
            play.get('homeScore', 0),
            play.get('awayScore', 0),
            play.get('text', '')
        ))

    if pbp_data:
        insert_query = """
            INSERT INTO pbp_events (
                game_id, sequence_number, period, clock_seconds, elapsed_seconds,
                team_id, player_name, event_type, points_scored,
                home_score, away_score, description
            ) VALUES %s
            ON CONFLICT (game_id, sequence_number) DO NOTHING
        """
        execute_values(cursor, insert_query, pbp_data)
        conn.commit()
        cursor.close()
        return len(pbp_data)

    cursor.close()
    return 0

def save_r69_events(conn, db_game_id, r69_events, final_home_score, final_away_score):
    """Save R69 events to database"""
    cursor = conn.cursor()

    for event in r69_events:
        # Determine if this was an R69W (won after hitting 69 first)
        # Compare final scores to see if this team won
        team_id = event['team_id']

        # We need to determine if this team won
        # This is a simplified check - you might need home/away logic
        r69w = False  # Default to False, will be updated with actual logic
        final_margin = 0

        insert_query = """
            INSERT INTO r69_events (
                game_id, team_id, team_name, t_to_69, period_at_69,
                margin_at_69, score_at_69_opponent, r69w, final_margin, play_description
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id, team_id) DO NOTHING
        """

        cursor.execute(insert_query, (
            db_game_id,
            team_id,
            event['team_name'],
            event['t_to_69'],
            event['period'],
            event['margin_at_69'],
            event['opponent_score'],
            r69w,  # Will need to calculate this properly
            final_margin,
            event['description']
        ))

    conn.commit()
    cursor.close()

def main():
    print("=" * 60)
    print("R69W Missing PBP Data Fetcher")
    print("=" * 60)
    print()

    if not DATABASE_URL:
        print("ERROR: DATABASE_URL not found in environment")
        sys.exit(1)

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✓ Connected to database")
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

    # Get games without PBP
    print("\nFinding games without PBP data...")
    games_without_pbp = get_games_without_pbp(conn)
    total_games = len(games_without_pbp)

    print(f"Found {total_games} games without PBP data")

    if total_games == 0:
        print("All games have PBP data!")
        conn.close()
        return

    # Ask user how many to process
    print(f"\nHow many games would you like to process?")
    print(f"1. Process 10 games (test)")
    print(f"2. Process 50 games")
    print(f"3. Process 100 games")
    print(f"4. Process all {total_games} games")
    print(f"5. Custom amount")

    choice = input("\nEnter choice (1-5): ").strip()

    if choice == '1':
        limit = 10
    elif choice == '2':
        limit = 50
    elif choice == '3':
        limit = 100
    elif choice == '4':
        limit = total_games
    elif choice == '5':
        limit = int(input("Enter number of games: "))
    else:
        print("Invalid choice")
        conn.close()
        return

    games_to_process = games_without_pbp[:limit]

    print(f"\nProcessing {len(games_to_process)} games...")
    print()

    success_count = 0
    error_count = 0

    for idx, game in enumerate(games_to_process, 1):
        db_game_id, espn_game_id, home_team, away_team, game_date, league, status = game

        print(f"[{idx}/{len(games_to_process)}] {home_team} vs {away_team}")
        print(f"  Date: {game_date}, ESPN ID: {espn_game_id}")

        # Determine league string for API
        league_str = 'mens-college-basketball' if league == 'mens' else 'womens-college-basketball'

        # Fetch PBP data
        pbp_data = fetch_play_by_play(espn_game_id, league_str)

        if not pbp_data:
            print(f"  ✗ No PBP data available")
            error_count += 1
            time.sleep(0.5)  # Rate limiting
            continue

        # Extract plays
        plays = []
        if 'plays' in pbp_data:
            for play_group in pbp_data['plays']:
                if isinstance(play_group, dict) and 'items' in play_group:
                    plays.extend(play_group['items'])

        if not plays:
            print(f"  ✗ No plays found in response")
            error_count += 1
            time.sleep(0.5)
            continue

        # Save PBP events
        pbp_count = save_pbp_events(conn, db_game_id, plays)
        print(f"  ✓ Saved {pbp_count} PBP events")

        # Detect and save R69 events
        # Get team info from header
        header = pbp_data.get('header', {})
        competitions = header.get('competitions', [{}])
        if competitions:
            competitors = competitions[0].get('competitors', [])
            home_team_id = None
            away_team_id = None
            home_team_name = None
            away_team_name = None
            home_score = 0
            away_score = 0

            for comp in competitors:
                if comp.get('homeAway') == 'home':
                    home_team_id = comp.get('id')
                    home_team_name = comp.get('team', {}).get('displayName', '')
                    home_score = int(comp.get('score', 0))
                else:
                    away_team_id = comp.get('id')
                    away_team_name = comp.get('team', {}).get('displayName', '')
                    away_score = int(comp.get('score', 0))

            if home_team_id and away_team_id:
                r69_events = detect_r69_event(plays, home_team_id, away_team_id,
                                              home_team_name, away_team_name)
                if r69_events:
                    save_r69_events(conn, db_game_id, r69_events, home_score, away_score)
                    print(f"  ✓ Detected {len(r69_events)} R69 event(s)")

        success_count += 1

        # Rate limiting - be nice to ESPN API
        time.sleep(0.5)

    conn.close()

    print()
    print("=" * 60)
    print(f"COMPLETE: Processed {success_count} games successfully")
    print(f"Errors: {error_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
