#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Team Logo Fetcher
Fetches and stores team logos from ESPN API for all teams in the database
"""

import os
import sys
import requests
import psycopg2
from dotenv import load_dotenv
import time

# Fix Windows console encoding
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

def fetch_team_logo(team_id, league='mens-college-basketball'):
    """Fetch team logo URL from ESPN API"""
    try:
        url = f"{ESPN_API_BASE}/{league}/teams/{team_id}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        team = data.get('team', {})
        logos = team.get('logos', [])

        # Get the first logo (usually the best quality)
        if logos:
            return logos[0].get('href')

        # Fallback to team logo field
        return team.get('logo')
    except Exception as e:
        print(f"  Error fetching logo for team {team_id}: {e}")
        return None

def get_unique_teams(cursor):
    """Get all unique teams from games"""
    cursor.execute("""
        SELECT DISTINCT
            home_team_id as team_id,
            home_team_name as team_name,
            home_team_logo as current_logo
        FROM games
        WHERE home_team_id IS NOT NULL AND home_team_id != ''
        UNION
        SELECT DISTINCT
            away_team_id as team_id,
            away_team_name as team_name,
            away_team_logo as current_logo
        FROM games
        WHERE away_team_id IS NOT NULL AND away_team_id != ''
        ORDER BY team_name
    """)
    return cursor.fetchall()

def update_team_logos(cursor, team_id, logo_url):
    """Update logo for all games with this team"""
    cursor.execute("""
        UPDATE games
        SET home_team_logo = %s, updated_at = NOW()
        WHERE home_team_id = %s
    """, (logo_url, team_id))

    home_updated = cursor.rowcount

    cursor.execute("""
        UPDATE games
        SET away_team_logo = %s, updated_at = NOW()
        WHERE away_team_id = %s
    """, (logo_url, team_id))

    away_updated = cursor.rowcount

    return home_updated + away_updated

def main():
    """Main execution"""
    print("\n" + "=" * 80)
    print("🏀 TEAM LOGO FETCHER")
    print("=" * 80)
    print("\nFetches team logos from ESPN API and updates the database")
    print("=" * 80)

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("\n✅ Connected to database")
    except Exception as e:
        print(f"\n❌ Database connection failed: {e}")
        return

    # Get all unique teams
    print("\n📊 Fetching teams from database...")
    teams = get_unique_teams(cursor)
    print(f"Found {len(teams)} unique teams")

    # Stats
    total_teams = len(teams)
    updated = 0
    already_had_logo = 0
    failed = 0

    print("\n🔄 Fetching logos...")
    print("─" * 80)

    for team_id, team_name, current_logo in teams:
        print(f"\n[{updated + already_had_logo + failed + 1}/{total_teams}] {team_name}")
        print(f"  Team ID: {team_id}")

        # Check if already has logo
        if current_logo and current_logo.strip():
            print(f"  ✓ Already has logo: {current_logo[:60]}...")
            already_had_logo += 1
            continue

        # Fetch logo
        print(f"  Fetching logo from ESPN...")
        logo_url = fetch_team_logo(team_id)

        if logo_url:
            print(f"  ✓ Found: {logo_url[:60]}...")

            # Update database
            games_updated = update_team_logos(cursor, team_id, logo_url)
            conn.commit()

            print(f"  ✓ Updated {games_updated} games")
            updated += 1
        else:
            print(f"  ✗ No logo found")
            failed += 1

        # Rate limiting
        time.sleep(0.5)

    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total teams: {total_teams}")
    print(f"Already had logos: {already_had_logo}")
    print(f"Newly fetched: {updated}")
    print(f"Failed to fetch: {failed}")
    print("=" * 80)
    print("\n✅ Logo fetching complete!\n")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Process interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
