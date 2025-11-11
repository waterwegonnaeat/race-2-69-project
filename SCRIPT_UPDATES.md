# Historical Data Fetcher Script Updates

**Updated**: November 10, 2024

---

## 🎯 New Features

### 1. **Specific Season Selection**

You can now select any individual season from **2015-16** through the current season!

**How to use:**

```bash
# Interactive mode
python fetch_historical_data.py

# Select option 8, then enter season
# Examples: 2015-16, 2016-17, 2020-21, 2023-24
```

**Command-line mode:**
```bash
# Using --season flag (coming soon)
python fetch_historical_data.py --season 2015-16
```

---

### 2. **Smart Caching & Skip Optimization**

The script now checks if games already exist in the database before fetching them!

**Benefits:**
- ⚡ **Faster execution** - Skip games that are already stored
- 💾 **Reduced API calls** - Don't re-fetch existing data
- 🔄 **Safe re-runs** - Run the script multiple times without duplicates
- 📊 **Better reporting** - See how many games were cached vs. new

**How it works:**
- Before processing each game, checks if ESPN game ID exists in database
- If exists, displays `[CACHED]` and skips to next game
- If new, processes normally with `[OK]` message
- Summary shows both new and cached counts

---

## 📋 Updated Menu

```
📅 QUICK OPTIONS:
  1. Last 7 days (any games)
  2. Last 30 days (any games)
  3. Custom number of days (any games)

🏀 SEASON OPTIONS:
  4. Current season only
  5. Last 2 seasons
  6. Last 5 seasons
  7. Last 10 seasons

🎯 SPECIFIC SEASON:
  8. Select specific season (2015-16 through current)
     Examples: 2015-16, 2020-21, 2023-24
```

---

## 🚀 Usage Examples

### Example 1: Fetch 2015-16 Season

```bash
cd scripts
python fetch_historical_data.py
# Select: 8
# Enter: 2015-16
```

**Output:**
```
✅ Selected season: 2015-16

Fetching 1 basketball season(s):
  2015-16: 2015-11-01 to 2016-04-10

📊 Fetching games...
────────────────────────────────────────────────────────────────────────────────
Note: Games already in database will be skipped for optimization

============================================================
SEASON: 2015-16
============================================================

[2015-11-01]
  Found 15 games
    [OK] Duke vs Kentucky
    [OK] UNC vs Wisconsin
    ...

[2015-11-02]
  No games found

[2015-11-10]
  Found 45 games
    [OK] Kansas vs Michigan St
    [CACHED] Duke vs Army - already exists, skipping...
    ...
```

---

### Example 2: Re-run Same Season (with caching)

**First run:**
```
Total games processed (new): 1,247
Total games skipped (cached): 0
Total games scanned: 1,247
```

**Second run (same season):**
```
Total games processed (new): 0
Total games skipped (cached): 1,247
Total games scanned: 1,247

⚡ Optimization: Skipped 1,247 existing games
```

---

### Example 3: Backfill Multiple Seasons

```bash
# Fetch all seasons from 2015-16 to current
python fetch_historical_data.py
# Select: 7 (Last 10 seasons)
```

This will process seasons chronologically (oldest to newest):
- 2015-16
- 2016-17
- 2017-18
- ... (through current season)

---

## 🔧 Technical Details

### New Functions

#### `get_specific_season(season_label)`
Parses and validates a season string (e.g., "2015-16")

**Returns:**
```python
{
    'start': datetime(2015, 11, 1),
    'end': datetime(2016, 4, 10),
    'label': '2015-16'
}
```

**Validation:**
- Checks format is "YYYY-YY"
- Validates end year = start year + 1
- Ensures season isn't in the future
- Adjusts end date for current season

---

#### `check_game_exists(cursor, espn_game_id)`
Checks if a game is already in the database

**Parameters:**
- `cursor`: Database cursor
- `espn_game_id`: ESPN game ID (string)

**Returns:** `True` if exists, `False` otherwise

**SQL:**
```sql
SELECT id FROM games WHERE game_id = %s
```

---

#### `check_pbp_exists(cursor, game_db_id)`
Checks if play-by-play data exists for a game

**Parameters:**
- `cursor`: Database cursor
- `game_db_id`: Internal database game UUID

**Returns:** `True` if PBP data exists, `False` otherwise

**SQL:**
```sql
SELECT COUNT(*) FROM pbp_events WHERE game_id = %s
```

---

### Performance Impact

**Before optimization:**
- Every game fetch: ~2-3 seconds (API + processing)
- Re-running same period: Same time as first run
- 1,000 games: ~40-50 minutes

**After optimization:**
- Cached game check: ~0.01 seconds (database query)
- Re-running same period: ~1-2 minutes for 1,000 games
- **95% time savings** on re-runs

---

## 📊 Summary Output

New summary format includes caching statistics:

```
================================================================================
📊 SUMMARY
================================================================================
Total games processed (new): 247
Total games skipped (cached): 1,000
Total games scanned: 1,247
Total R69 events detected: 183
Total R69W: 134
R69W Rate: 73.2%
Total errors: 0

⚡ Optimization: Skipped 1,000 existing games
================================================================================

✅ Data ingestion complete!
```

---

## 🎓 Best Practices

### 1. **Backfilling Historical Data**

Start with oldest seasons first:

```bash
# Year 1: 2015-16
python fetch_historical_data.py
# Select: 8, Enter: 2015-16

# Year 2: 2016-17
python fetch_historical_data.py
# Select: 8, Enter: 2016-17

# ... continue through current season
```

Or use multi-season option:
```bash
python fetch_historical_data.py
# Select: 7 (Last 10 seasons)
```

---

### 2. **Handling Interrupted Runs**

If the script is interrupted mid-season:

```bash
# Just re-run the same command
python fetch_historical_data.py
# Select: 8, Enter: 2015-16

# The script will:
# - Skip games already in database (cached)
# - Continue from where it left off
# - Only fetch new/missing games
```

---

### 3. **Updating Current Season**

During the basketball season, run regularly:

```bash
# Weekly updates
python fetch_historical_data.py
# Select: 4 (Current season)

# Or daily for recent games
python fetch_historical_data.py
# Select: 1 (Last 7 days)
```

---

## 🐛 Troubleshooting

### Issue: "Invalid season format"

**Problem:** Entered season doesn't match expected format

**Solution:**
- Use format: `YYYY-YY` (e.g., `2015-16`)
- Not: `2015-2016`, `15-16`, or `2015/16`
- Years must be consecutive (e.g., `2015-16`, not `2015-17`)

---

### Issue: Too many cached games

**Problem:** Running script but all games show as cached

**Solution:** This is expected behavior if you've already fetched that data!
- To fetch new data, select a different date range or season
- To re-fetch (not recommended), manually delete from database first

---

### Issue: Season validation fails

**Problem:** Valid season returns None

**Check:**
- Season must not be in the future
- Season must be 2015-16 or later
- Current season end date is auto-adjusted to today

---

## 📈 Roadmap

Future enhancements:
- [ ] Command-line flag for specific season: `--season 2015-16`
- [ ] Date range for season: `--from 2015-11-01 --to 2016-04-10`
- [ ] Force re-fetch option: `--force`
- [ ] Dry-run mode: `--dry-run`
- [ ] Progress bar for long seasons
- [ ] Concurrent game fetching (threading)
- [ ] Resume from specific date if interrupted

---

## 🔍 Example: Full Backfill Workflow

**Goal:** Populate database with all games from 2015-16 to current

**Step 1:** Fetch last 10 seasons
```bash
python fetch_historical_data.py
# Select: 7
```

**Step 2:** Verify data
```sql
SELECT season, COUNT(*) as games
FROM games
GROUP BY season
ORDER BY season;
```

**Step 3:** Fill gaps (if any missing seasons)
```bash
# For each missing season
python fetch_historical_data.py
# Select: 8, Enter: <season>
```

**Expected results:**
- ~1,000-1,500 games per season
- ~10,000-15,000 total games
- Processing time: 6-10 hours (with API rate limits)
- Re-run time: 2-5 minutes (all cached)

---

## 💡 Tips

1. **Run overnight** - Full season fetches can take hours
2. **Check progress** - Script commits after each day, safe to interrupt
3. **Monitor errors** - Summary shows error count
4. **Validate data** - Check R69W rate (~73%) to verify data quality
5. **Regular updates** - Run weekly during season for fresh data

---

**Last Updated**: November 10, 2024
**Script Version**: 2.0
**New Features**: Specific season selection, smart caching
