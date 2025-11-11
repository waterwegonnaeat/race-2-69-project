#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove Old Seasons Script
Removes all games before the 2021-2022 season from the database.
This is necessary because older data may be incomplete due to 502 server errors during fetch.

Usage:
    python remove_old_seasons.py           # Dry run - show what will be removed
    python remove_old_seasons.py --confirm # Actually remove the data
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

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

def remove_old_seasons(confirm=False):
    """Remove all games before the 2021-2022 season"""

    print("=" * 60)
    print("🗑️  Remove Old Seasons Script")
    print("=" * 60)
    print()
    print("This script will remove all games before the 2021-2022 season")
    print("from the database due to incomplete data caused by 502 errors.")
    print()

    if not confirm:
        print("⚠️  DRY RUN MODE - No data will be deleted")
        print("    Run with --confirm to actually delete data")
        print()

    if not DATABASE_URL:
        print("❌ DATABASE_URL not found in environment variables")
        sys.exit(1)

    try:
        # Connect to database
        print("📡 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("✅ Connected successfully\n")

        # Get all seasons before 2021-22 dynamically
        cur.execute("""
            SELECT DISTINCT season
            FROM games
            WHERE season < '2021-22'
            ORDER BY season
        """)

        seasons_to_remove = [row[0] for row in cur.fetchall()]

        if not seasons_to_remove:
            print("✅ No seasons found before 2021-2022. Database is already clean!")
            cur.close()
            conn.close()
            return

        print("🔍 Checking data before removal...\n")

        # Get count of games by season
        cur.execute("""
            SELECT season, COUNT(*) as game_count
            FROM games
            GROUP BY season
            ORDER BY season
        """)

        all_seasons = cur.fetchall()
        print("Current games by season:")
        print("-" * 60)
        total_games = 0
        games_to_remove = 0

        for season, count in all_seasons:
            total_games += count
            marker = "  [TO BE REMOVED]" if season in seasons_to_remove else ""
            print(f"  {season}: {count:,} games{marker}")
            if season in seasons_to_remove:
                games_to_remove += count

        print("-" * 60)
        print(f"  Total: {total_games:,} games")
        print()

        if games_to_remove == 0:
            print("✅ No games found before 2021-2022 season. Database is already clean!")
            cur.close()
            conn.close()
            return

        print(f"⚠️  About to remove {games_to_remove:,} games from {len(seasons_to_remove)} seasons")
        print()

        # Check for R69 events that will be removed
        cur.execute("""
            SELECT COUNT(DISTINCT r.id) as r69_count
            FROM r69_events r
            JOIN games g ON g.id = r.game_id
            WHERE g.season = ANY(%s)
        """, (seasons_to_remove,))

        r69_to_remove = cur.fetchone()[0]
        print(f"📊 This will also remove {r69_to_remove:,} R69 events")
        print()

        # Check for PBP events that will be removed
        cur.execute("""
            SELECT COUNT(DISTINCT p.id) as pbp_count
            FROM pbp_events p
            JOIN games g ON g.id = p.game_id
            WHERE g.season = ANY(%s)
        """, (seasons_to_remove,))

        pbp_to_remove = cur.fetchone()[0]
        print(f"📊 This will also remove {pbp_to_remove:,} PBP events")
        print()

        # Handle confirmation
        print("=" * 60)

        if not confirm:
            print("✅ Dry run complete - no data was deleted")
            print()
            print("To actually remove this data, run:")
            print("    python scripts/remove_old_seasons.py --confirm")
            print()
            cur.close()
            conn.close()
            return

        print("⚠️  CONFIRM FLAG DETECTED - Proceeding with deletion...")
        print()
        print("🗑️  Removing old data...")
        print()

        # Remove games (cascades will handle r69_events and pbp_events)
        cur.execute("""
            DELETE FROM games
            WHERE season = ANY(%s)
        """, (seasons_to_remove,))

        deleted_count = cur.rowcount

        # Commit the transaction
        conn.commit()

        print(f"✅ Successfully removed {deleted_count:,} games")
        print()

        # Verify removal
        print("🔍 Verifying removal...\n")

        cur.execute("""
            SELECT season, COUNT(*) as game_count
            FROM games
            GROUP BY season
            ORDER BY season
        """)

        remaining_seasons = cur.fetchall()
        print("Remaining games by season:")
        print("-" * 60)
        total_remaining = 0

        for season, count in remaining_seasons:
            total_remaining += count
            print(f"  {season}: {count:,} games")

        print("-" * 60)
        print(f"  Total: {total_remaining:,} games")
        print()

        # Check R69 events
        cur.execute("SELECT COUNT(*) FROM r69_events")
        remaining_r69 = cur.fetchone()[0]
        print(f"📊 Remaining R69 events: {remaining_r69:,}")

        # Check PBP events
        cur.execute("SELECT COUNT(*) FROM pbp_events")
        remaining_pbp = cur.fetchone()[0]
        print(f"📊 Remaining PBP events: {remaining_pbp:,}")
        print()

        print("=" * 60)
        print("✅ Old seasons removed successfully!")
        print("=" * 60)

        # Close connection
        cur.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        sys.exit(1)

if __name__ == "__main__":
    # Check for --confirm flag
    confirm = '--confirm' in sys.argv
    remove_old_seasons(confirm=confirm)
