# R69W Data Fetcher - Usage Guide

## Overview

The optimized `fetch_historical_data.py` script now supports:
- ✅ **Basketball season-only fetching** (November - April)
- ✅ **Multi-year season support** (up to 20 seasons)
- ✅ **Automatic R69 event detection**
- ✅ **Play-by-play data collection**

This dramatically reduces fetch time by skipping the off-season (May-October) when no NCAA basketball games occur.

---

## Quick Start

```bash
cd scripts
python fetch_historical_data.py
```

---

## Fetch Options

### Option 1: Last 7 Days (Any Games)
- **Use Case**: Quick test or recent data update
- **Time Range**: Previous 7 calendar days
- **Includes Off-Season**: Yes

### Option 2: Last 30 Days (Any Games)
- **Use Case**: Monthly data refresh
- **Time Range**: Previous 30 calendar days
- **Includes Off-Season**: Yes

### Option 3: Current Season Only ⭐ **RECOMMENDED FOR TESTING**
- **Use Case**: Populate current year data
- **Time Range**: Nov 1, 2024 - Apr 10, 2025 (or today if earlier)
- **Includes Off-Season**: No
- **Estimated Time**: ~30 minutes for full season
- **Example**: Fetches 2024-25 season only

### Option 4: Last 2 Seasons ⭐ **RECOMMENDED FOR QUICK HISTORICAL DATA**
- **Use Case**: Recent historical comparison
- **Time Range**: 2023-24 and 2024-25 seasons
- **Includes Off-Season**: No
- **Estimated Time**: ~1 hour
- **Example**:
  - 2024-25: Nov 1, 2024 - Apr 10, 2025
  - 2023-24: Nov 1, 2023 - Apr 10, 2024

### Option 5: Last 5 Seasons
- **Use Case**: Medium-term trends and analysis
- **Time Range**: 2020-21 through 2024-25
- **Includes Off-Season**: No
- **Estimated Time**: ~2-3 hours
- **Seasons**: 2024-25, 2023-24, 2022-23, 2021-22, 2020-21

### Option 6: Last 10 Seasons ⭐ **RECOMMENDED FOR FULL DATABASE**
- **Use Case**: Comprehensive historical analysis
- **Time Range**: 2015-16 through 2024-25
- **Includes Off-Season**: No
- **Estimated Time**: ~4-6 hours
- **Seasons**: 10 complete basketball seasons
- **Data Points**: ~30,000+ games (3,000+ per season)

### Option 7: Last 20 Seasons ⭐ **MAXIMUM HISTORICAL DATA**
- **Use Case**: Maximum historical coverage available from ESPN
- **Time Range**: 2005-06 through 2024-25
- **Includes Off-Season**: No
- **Estimated Time**: ~8-12 hours
- **Seasons**: 20 complete basketball seasons
- **Data Points**: ~60,000+ games
- **Note**: ESPN API data goes back to approximately 2002, so this gives near-maximum coverage

### Option 8: Custom Number of Days
- **Use Case**: Specific custom date ranges
- **Time Range**: Your specified number of days back
- **Includes Off-Season**: Yes
- **Note**: Use season options (3-7) instead for better performance

---

## What the Script Does

For each game:
1. ✅ Fetches game metadata (teams, scores, date, venue)
2. ✅ Inserts/updates game in database
3. ✅ Fetches play-by-play data from ESPN API
4. ✅ Stores all play-by-play events
5. ✅ Detects if any team hit 69 first while leading (R69 event)
6. ✅ Calculates if R69 team won (R69W) or lost (R69L)
7. ✅ Inserts R69 event with all metrics

---

## Basketball Season Dates

The script automatically handles basketball season dates:

- **Season Start**: November 1
  - (Early games can start in late October, but Nov 1 is a safe start)

- **Season End**: April 10
  - NCAA Tournament championship is typically first Monday in April
  - April 10 ensures full coverage including late tournament games

- **Off-Season Skipped**: May - October
  - Saves ~150 days × rate limits = significant time savings
  - No games occur during this period anyway

---

## Performance & Timing

### Rate Limiting
- 0.5 seconds between games
- 1 second between days
- Respectful of ESPN API (no official rate limits, but we're conservative)

### Estimated Fetch Times

| Option | Seasons | Days Fetched | Est. Games | Est. Time |
|--------|---------|--------------|------------|-----------|
| 1 | N/A | 7 | ~20-50 | 2 min |
| 2 | N/A | 30 | ~100-300 | 10 min |
| 3 | 1 | ~160 | ~3,000 | 30 min |
| 4 | 2 | ~320 | ~6,000 | 1 hour |
| 5 | 5 | ~800 | ~15,000 | 2-3 hours |
| 6 | 10 | ~1,600 | ~30,000 | 4-6 hours |
| 7 | 20 | ~3,200 | ~60,000 | 8-12 hours |

*Times vary based on network speed and database performance*

---

## Output Format

### During Fetch
```
============================================================
R69W HISTORICAL DATA FETCHER
============================================================

Fetching 2 basketball season(s):
  2024-25: 2024-11-01 to 2025-04-10
  2023-24: 2023-11-01 to 2024-04-10

[OK] Connected to database

Fetching games...
------------------------------------------------------------

============================================================
SEASON: 2024-25
============================================================

[2024-11-01]
  Found 5 games
    [OK] DUKE @ KENT
    [OK] UNC @ ELON
      [R69W] UNC Tar Heels hit 69 first at +8
    [OK] KU @ HOW
      [R69W] Kansas Jayhawks hit 69 first at +12
```

### After Completion
```
============================================================
SUMMARY
============================================================
Total games fetched: 6147
Total R69 events detected: 4523
R69W Rate: 73.2%

[OK] Data ingestion complete!
```

---

## Best Practices

### 1. Start Small, Scale Up
```bash
# First time? Start with option 3 (current season)
python fetch_historical_data.py
# Select: 3

# Happy with results? Go bigger
python fetch_historical_data.py
# Select: 6 (10 seasons)
```

### 2. Monitor Progress
- Watch the console output
- Check for R69 events being detected
- Verify games are being inserted

### 3. Handle Interruptions
- Script can be interrupted (Ctrl+C)
- Database commits happen after each day
- Safe to resume - duplicate games are handled with `ON CONFLICT`

### 4. Verify Data
After fetching, check your database:
```sql
-- Count games
SELECT COUNT(*) FROM games;

-- Count R69 events
SELECT COUNT(*) FROM r69_events;

-- R69W rate
SELECT
    COUNT(CASE WHEN r69w = true THEN 1 END) as r69_wins,
    COUNT(*) as total_r69,
    ROUND(COUNT(CASE WHEN r69w = true THEN 1 END)::numeric / COUNT(*) * 100, 1) as r69w_rate
FROM r69_events;
```

---

## Troubleshooting

### Issue: "No games found" for many days
**Solution**: This is normal during off-season. Use season options (3-7) to skip these dates.

### Issue: "Failed to fetch PBP"
**Solution**: Some older games may not have play-by-play data. This is normal and the game is still stored.

### Issue: Very slow performance
**Solution**:
- Check your internet connection
- Verify database performance
- Consider running overnight for large fetches (options 6-7)

### Issue: Database connection errors
**Solution**:
- Verify `.env.local` has correct `DATABASE_URL`
- Check database is running (if local)
- Test connection: `psql $DATABASE_URL`

### Issue: "Transaction aborted"
**Solution**:
- Script will skip that day and continue
- Check error message for specific issue
- Can safely re-run to retry

---

## Data Coverage by Season

ESPN API provides reliable data back to approximately **2002**:

| Seasons | Years | Data Quality |
|---------|-------|--------------|
| 2020-25 | Last 5 years | ⭐⭐⭐⭐⭐ Excellent - Full PBP |
| 2015-20 | 5-10 years ago | ⭐⭐⭐⭐ Very Good - Most PBP available |
| 2010-15 | 10-15 years ago | ⭐⭐⭐ Good - Some PBP may be missing |
| 2005-10 | 15-20 years ago | ⭐⭐ Fair - PBP coverage varies |
| 2002-05 | 20+ years ago | ⭐ Limited - Basic game data |

---

## Integration with UI

After fetching data, the R69W Analytics web application will automatically display:

- Updated game counts
- Accurate R69W statistics for all teams
- Team-by-team R69 performance
- Historical trends across seasons

No additional configuration needed - just refresh your browser!

---

## Next Steps

### Option A: Quick Test (10 minutes)
```bash
cd scripts
python fetch_historical_data.py
# Select: 3 (Current season only)
```

### Option B: Build Full Database (4-6 hours)
```bash
cd scripts
python fetch_historical_data.py
# Select: 6 (Last 10 seasons)
# Go grab lunch, check back later!
```

### Option C: Maximum Historical Data (Overnight)
```bash
cd scripts
nohup python fetch_historical_data.py > fetch.log 2>&1 &
# When prompted, select: 7 (Last 20 seasons)
# Check progress: tail -f fetch.log
```

---

## Advanced: Fetch Specific Teams Only

To fetch just Arkansas Razorbacks (or any specific team):
```bash
cd scripts
python fetch_arkansas_games.py
```

This specialized script:
- Fetches team schedule from ESPN
- Only processes games for that team
- Faster than fetching entire database
- Good for debugging specific team issues

---

## Performance Tips

### 1. Database Optimization
```sql
-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_r69_team ON r69_events(team_id);
CREATE INDEX IF NOT EXISTS idx_r69_game ON r69_events(game_id);
```

### 2. Run During Off-Peak Hours
- Less network congestion
- Better ESPN API response times
- Fewer interruptions

### 3. Monitor System Resources
```bash
# Check disk space
df -h

# Monitor during fetch
htop  # or top
```

---

## FAQ

**Q: Can I run this multiple times?**
A: Yes! The script handles duplicates gracefully. Existing games are updated, new games are inserted.

**Q: What if I stop mid-fetch?**
A: Safe to interrupt. Data is committed after each day. Resume anytime.

**Q: How do I know if R69 detection is working?**
A: Watch for `[R69W]` or `[R69L]` tags in output. Check database `r69_events` table.

**Q: Can I fetch women's basketball?**
A: Currently men's only. Women's support requires updating ESPN API endpoints.

**Q: What about conference tournaments?**
A: Yes! All games including conference tournaments and NCAA tournament are fetched.

**Q: How much disk space needed?**
A: ~2-5 GB for 20 seasons of data (games + play-by-play events)

---

## Support

If you encounter issues:
1. Check this guide
2. Review console error messages
3. Verify database connection
4. Check ESPN API is accessible: `curl "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard"`

---

**Happy Data Fetching! 🏀**

*Remember: The R69W phenomenon is real - teams hitting 69 first while leading win ~73% of games!*
