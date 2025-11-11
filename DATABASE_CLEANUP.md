# Database Cleanup & Data Quality Guide

## Overview

This document outlines known data quality issues in the Race to 69 database and provides scripts and procedures for cleaning up bad data.

---

## Table of Contents

1. [Known Data Quality Issues](#known-data-quality-issues)
2. [Diagnostic Queries](#diagnostic-queries)
3. [Cleanup Scripts](#cleanup-scripts)
4. [Validation Procedures](#validation-procedures)
5. [Preventive Measures](#preventive-measures)

---

## Known Data Quality Issues

### 1. Season Assignment Errors (FIXED ✅)

**Issue**: Games in April were incorrectly assigned to the next season instead of the current season.

**Impact**: 4,167 games had wrong season values (e.g., April 2025 games marked as "2025-26" instead of "2024-25")

**Root Cause**: Season calculation logic in `fetch_historical_data.py` only treated Jan-Mar as previous season

**Fix Applied**: Updated logic to include April (month <= 4)

**Cleanup Script**: `scripts/fix-seasons.js` (already run)

---

### 2. Duplicate Team IDs

**Issue**: Some teams have multiple team IDs in the database, causing data fragmentation

**Examples Found**:
- Abilene Christian: Team ID `2000` (appears twice in unique teams query)
- Akron: Team ID `2006` (appears twice)
- Alabama: Team ID `333` (appears twice)
- Auburn: Team ID `2` (appears twice)
- Duke: Both `"duke"` (string) and `150` (numeric)
- Kansas: Both `"kansas"` (string) and `2305` (numeric)
- Kentucky: Both `"kentucky"` (string) and `96` (numeric)

**Impact**:
- Logo fetching runs twice for same team
- Statistics may be split across different team IDs
- Potential for inconsistent team naming

**Detection Query**:
```sql
-- Find duplicate team names with different IDs
SELECT
  home_team_name,
  array_agg(DISTINCT home_team_id) as team_ids,
  COUNT(DISTINCT home_team_id) as id_count
FROM games
WHERE home_team_id IS NOT NULL
GROUP BY home_team_name
HAVING COUNT(DISTINCT home_team_id) > 1
ORDER BY id_count DESC;
```

**Cleanup Strategy**:
1. Identify canonical team ID (usually numeric ESPN ID)
2. Update all games with string IDs to use numeric IDs
3. Update r69_events table if necessary
4. Run logo fetch to ensure consistency

---

### 3. Missing Team Logos

**Issue**: ~5% of teams (24 out of 579) don't have logos in the database

**Affected Teams** (from fetch_team_logos.py output):
- Anderson (SC) Trojans (ID: 380)
- Antelope Valley (ID: 109597)
- Arlington Baptist Patriots (ID: 3166)
- Berea Mountaineers (ID: 2061)
- Bethel (IN) Pilots (ID: 122634)
- Bethesda University Flames (ID: 3246)
- Blue Mountain Toppers (ID: 494)
- Bluefield University Ramblin' Rams (ID: 495)
- Bryn Athyn Lions (ID: 109684)
- Cairn University Highlanders (ID: 3216)
- Cal Maritime Keelhaulers (ID: 500)
- Cal State LA Golden Eagles (ID: 2345)
- Calumet Crimson Wave (ID: 502)
- Campbellsville-Harrodsburg Pioneers (ID: 111921)
- Cardinal Stritch Wolves (ID: 2100)
- Carver College Cougars (ID: 3117)
- Central Christian College Tigers (ID: 112698)
- Champion Christian Tigers (ID: 3134)
- Cincinnati Clermont Cougars (ID: 108799)
- Colby-Sawyer Chargers (ID: 35)
- Colorado Christian Cougars (ID: 2862)
- And more...

**Impact**: UI shows team initials fallback instead of logos

**Possible Solutions**:
1. Manual logo upload to database
2. Find alternative logo sources (official team websites)
3. Use generic conference/division logos as fallback
4. Leave as-is with initials fallback (current behavior)

---

### 4. Empty or Null Team IDs

**Issue**: Some games may have empty string or null team IDs

**Detection Query**:
```sql
-- Find games with missing team IDs
SELECT COUNT(*) as games_with_missing_ids
FROM games
WHERE home_team_id IS NULL
   OR home_team_id = ''
   OR away_team_id IS NULL
   OR away_team_id = '';

-- Get details
SELECT id, game_id, game_date, home_team_name, home_team_id, away_team_name, away_team_id
FROM games
WHERE home_team_id IS NULL
   OR home_team_id = ''
   OR away_team_id IS NULL
   OR away_team_id = ''
LIMIT 20;
```

**Cleanup Strategy**:
- Research ESPN API to find correct team IDs
- Update games with proper team IDs
- Re-run logo fetcher

---

### 5. Inconsistent Team Names

**Issue**: Team names may have slight variations (capitalization, abbreviations, etc.)

**Detection Query**:
```sql
-- Find similar team names (potential duplicates)
SELECT
  LOWER(home_team_name) as lowercase_name,
  array_agg(DISTINCT home_team_name) as name_variations,
  COUNT(DISTINCT home_team_name) as variation_count
FROM games
GROUP BY LOWER(home_team_name)
HAVING COUNT(DISTINCT home_team_name) > 1
ORDER BY variation_count DESC;
```

**Impact**: Team filtering may not work correctly if names don't match exactly

---

### 6. R69 Event Data Integrity

**Issue**: Potential mismatches between games and r69_events tables

**Detection Queries**:
```sql
-- R69 events without matching games
SELECT COUNT(*) as orphaned_r69_events
FROM r69_events r
WHERE NOT EXISTS (
  SELECT 1 FROM games g WHERE g.id = r.game_id
);

-- Games with r69_event flag but no r69_events record
SELECT COUNT(*) as missing_r69_records
FROM games g
WHERE g.r69_event_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM r69_events r WHERE r.id = g.r69_event_id
  );

-- R69 events where team name doesn't match game
SELECT r.id, r.game_id, r.team_name, g.home_team_name, g.away_team_name
FROM r69_events r
JOIN games g ON g.id = r.game_id
WHERE r.team_name != g.home_team_name
  AND r.team_name != g.away_team_name
LIMIT 20;
```

---

### 7. Invalid Game Dates

**Issue**: Games with dates outside reasonable basketball season range

**Detection Query**:
```sql
-- Find games with suspicious dates
SELECT id, game_id, game_date, season, home_team_name, away_team_name
FROM games
WHERE EXTRACT(MONTH FROM game_date) IN (6, 7, 8, 9, 10) -- Summer months
   OR EXTRACT(YEAR FROM game_date) < 2020
   OR EXTRACT(YEAR FROM game_date) > 2026
ORDER BY game_date;
```

---

### 8. Score Anomalies

**Issue**: Games with impossible or suspicious scores

**Detection Queries**:
```sql
-- Extremely high scores (potential data entry errors)
SELECT id, game_id, game_date, home_team_name, home_score, away_team_name, away_score
FROM games
WHERE home_score > 150 OR away_score > 150
ORDER BY GREATEST(home_score, away_score) DESC;

-- Tied games in college basketball (rare but valid)
SELECT COUNT(*) as tied_games
FROM games
WHERE home_score = away_score
  AND home_score IS NOT NULL
  AND game_status = 'FINAL';

-- Games where R69 score doesn't match expectations
SELECT r.id, g.game_id, r.score_at_69, r.score_at_69_opponent
FROM r69_events r
JOIN games g ON g.id = r.game_id
WHERE r.score_at_69 != 69; -- Should always be 69
```

---

### 9. Missing Play-by-Play Data

**Issue**: Some games may lack detailed play-by-play records

**Detection Query**:
```sql
-- Games without any PBP events
SELECT g.id, g.game_id, g.game_date, g.home_team_name, g.away_team_name
FROM games g
LEFT JOIN pbp_events p ON p.game_id = g.id
WHERE p.id IS NULL
  AND g.game_status = 'FINAL'
LIMIT 50;

-- Count games with/without PBP
SELECT
  COUNT(DISTINCT g.id) as total_games,
  COUNT(DISTINCT p.game_id) as games_with_pbp,
  COUNT(DISTINCT g.id) - COUNT(DISTINCT p.game_id) as games_without_pbp
FROM games g
LEFT JOIN pbp_events p ON p.game_id = g.id
WHERE g.game_status = 'FINAL';
```

---

## Diagnostic Queries

### Comprehensive Data Quality Check

Run this query to get an overview of data quality:

```sql
SELECT
  'Total Games' as metric,
  COUNT(*)::text as value
FROM games

UNION ALL

SELECT
  'Games with Missing Team IDs',
  COUNT(*)::text
FROM games
WHERE home_team_id IS NULL OR home_team_id = ''
   OR away_team_id IS NULL OR away_team_id = ''

UNION ALL

SELECT
  'Games with Missing Scores',
  COUNT(*)::text
FROM games
WHERE (home_score IS NULL OR away_score IS NULL)
  AND game_status = 'FINAL'

UNION ALL

SELECT
  'R69 Events',
  COUNT(*)::text
FROM r69_events

UNION ALL

SELECT
  'Teams with Logos',
  COUNT(DISTINCT home_team_id)::text
FROM games
WHERE home_team_logo IS NOT NULL

UNION ALL

SELECT
  'Total Unique Teams',
  COUNT(DISTINCT home_team_id)::text
FROM games
WHERE home_team_id IS NOT NULL

UNION ALL

SELECT
  'Games with PBP Data',
  COUNT(DISTINCT game_id)::text
FROM pbp_events

UNION ALL

SELECT
  'Seasons in Database',
  COUNT(DISTINCT season)::text
FROM games;
```

---

## Cleanup Scripts

### Script 1: Fix Duplicate Team IDs

**File**: `scripts/fix-duplicate-team-ids.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDuplicateTeamIds() {
  console.log('🔧 Fixing Duplicate Team IDs...\n')

  // Team ID mappings (string -> numeric canonical ID)
  const teamIdMappings = {
    'duke': '150',
    'kansas': '2305',
    'kentucky': '96',
  }

  for (const [oldId, newId] of Object.entries(teamIdMappings)) {
    console.log(`Fixing ${oldId} -> ${newId}`)

    // Update home team IDs
    const homeUpdated = await prisma.game.updateMany({
      where: { homeTeamId: oldId },
      data: { homeTeamId: newId },
    })

    // Update away team IDs
    const awayUpdated = await prisma.game.updateMany({
      where: { awayTeamId: oldId },
      data: { awayTeamId: newId },
    })

    // Update r69_events team IDs
    const r69Updated = await prisma.r69Event.updateMany({
      where: { teamId: oldId },
      data: { teamId: newId },
    })

    console.log(`  ✓ Updated ${homeUpdated.count} home games`)
    console.log(`  ✓ Updated ${awayUpdated.count} away games`)
    console.log(`  ✓ Updated ${r69Updated.count} R69 events\n`)
  }

  console.log('✅ Duplicate Team IDs fixed!')
}

fixDuplicateTeamIds()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
```

**Run**: `node scripts/fix-duplicate-team-ids.js`

---

### Script 2: Validate R69 Event Integrity

**File**: `scripts/validate-r69-events.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function validateR69Events() {
  console.log('🔍 Validating R69 Event Data Integrity...\n')

  // Check for orphaned r69_events
  const orphanedEvents = await prisma.$queryRaw`
    SELECT r.id, r.game_id, r.team_name
    FROM r69_events r
    WHERE NOT EXISTS (
      SELECT 1 FROM games g WHERE g.id = r.game_id
    )
  `

  if (orphanedEvents.length > 0) {
    console.log(`❌ Found ${orphanedEvents.length} orphaned R69 events:`)
    orphanedEvents.forEach(e => console.log(`  - Event ${e.id} for game ${e.game_id}`))
    console.log()
  } else {
    console.log('✅ No orphaned R69 events found\n')
  }

  // Check for mismatched team names
  const mismatchedNames = await prisma.$queryRaw`
    SELECT r.id, r.game_id, r.team_name, g.home_team_name, g.away_team_name
    FROM r69_events r
    JOIN games g ON g.id = r.game_id
    WHERE r.team_name != g.home_team_name
      AND r.team_name != g.away_team_name
  `

  if (mismatchedNames.length > 0) {
    console.log(`❌ Found ${mismatchedNames.length} R69 events with mismatched team names:`)
    mismatchedNames.forEach(e => {
      console.log(`  - Event ${e.id}: R69 team "${e.team_name}" not in game (${e.home_team_name} vs ${e.away_team_name})`)
    })
    console.log()
  } else {
    console.log('✅ All R69 event team names match their games\n')
  }

  // Check for invalid scores
  const invalidScores = await prisma.$queryRaw`
    SELECT id, game_id, team_name, score_at_69
    FROM r69_events
    WHERE score_at_69 != 69
  `

  if (invalidScores.length > 0) {
    console.log(`❌ Found ${invalidScores.length} R69 events with score != 69:`)
    invalidScores.forEach(e => console.log(`  - Event ${e.id}: score=${e.score_at_69}`))
    console.log()
  } else {
    console.log('✅ All R69 events have correct score of 69\n')
  }

  console.log('Validation complete!')
}

validateR69Events()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
```

**Run**: `node scripts/validate-r69-events.js`

---

### Script 3: Clean Up Missing Team IDs

**File**: `scripts/fix-missing-team-ids.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixMissingTeamIds() {
  console.log('🔧 Finding and Fixing Missing Team IDs...\n')

  // Find games with missing team IDs
  const gamesWithMissingIds = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamId: null },
        { homeTeamId: '' },
        { awayTeamId: null },
        { awayTeamId: '' },
      ],
    },
    select: {
      id: true,
      gameId: true,
      gameDate: true,
      homeTeamName: true,
      homeTeamId: true,
      awayTeamName: true,
      awayTeamId: true,
    },
  })

  console.log(`Found ${gamesWithMissingIds.length} games with missing team IDs\n`)

  if (gamesWithMissingIds.length === 0) {
    console.log('✅ No games with missing team IDs!')
    return
  }

  console.log('Games needing attention:')
  gamesWithMissingIds.forEach(game => {
    console.log(`  - Game ${game.gameId} (${game.gameDate}): ${game.homeTeamName} [${game.homeTeamId || 'MISSING'}] vs ${game.awayTeamName} [${game.awayTeamId || 'MISSING'}]`)
  })

  console.log('\n⚠️  Manual intervention required:')
  console.log('1. Look up correct team IDs from ESPN API')
  console.log('2. Update games manually or add to team ID mapping')
  console.log('3. Re-run this script to verify')
}

fixMissingTeamIds()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
```

**Run**: `node scripts/fix-missing-team-ids.js`

---

## Validation Procedures

### After Running Cleanup Scripts

1. **Verify Team Count**:
```sql
SELECT COUNT(DISTINCT home_team_id) as unique_teams
FROM games
WHERE home_team_id IS NOT NULL AND home_team_id != '';
```
Expected: ~579 teams (should not increase after fixing duplicates)

2. **Verify Logo Coverage**:
```sql
SELECT
  COUNT(DISTINCT home_team_id) as teams_with_logos,
  (SELECT COUNT(DISTINCT home_team_id) FROM games WHERE home_team_id IS NOT NULL) as total_teams,
  ROUND(
    COUNT(DISTINCT home_team_id)::numeric /
    (SELECT COUNT(DISTINCT home_team_id) FROM games WHERE home_team_id IS NOT NULL) * 100,
    2
  ) as coverage_percentage
FROM games
WHERE home_team_logo IS NOT NULL;
```
Expected: ~95% coverage

3. **Verify Season Data**:
```sql
-- April games should be in current season, not next season
SELECT season, COUNT(*) as april_games
FROM games
WHERE EXTRACT(MONTH FROM game_date) = 4
GROUP BY season
ORDER BY season DESC;
```

4. **Verify R69 Integrity**:
```sql
-- All R69 events should have matching games
SELECT
  (SELECT COUNT(*) FROM r69_events) as total_r69_events,
  (SELECT COUNT(*) FROM r69_events r WHERE EXISTS (SELECT 1 FROM games g WHERE g.id = r.game_id)) as valid_r69_events;
```

---

## Preventive Measures

### 1. Data Validation in Data Ingestion

Update `fetch_historical_data.py` to include validation:

```python
def validate_game_data(game_data):
    """Validate game data before inserting into database"""
    errors = []

    # Check required fields
    if not game_data.get('home_team_id'):
        errors.append(f"Missing home_team_id for game {game_data.get('game_id')}")

    if not game_data.get('away_team_id'):
        errors.append(f"Missing away_team_id for game {game_data.get('game_id')}")

    # Check score validity
    if game_data.get('home_score', 0) > 200:
        errors.append(f"Suspicious home score: {game_data.get('home_score')}")

    # Check date validity
    game_date = game_data.get('game_date')
    if game_date:
        month = game_date.month
        if month in [6, 7, 8, 9]:  # Summer months
            errors.append(f"Suspicious game date: {game_date} (summer month)")

    return errors

# Use before inserting data
errors = validate_game_data(game_data)
if errors:
    print(f"⚠️  Validation errors: {', '.join(errors)}")
    # Decide whether to skip or proceed with caution
```

### 2. Database Constraints

Add constraints to prevent bad data:

```sql
-- Ensure scores are reasonable
ALTER TABLE games ADD CONSTRAINT reasonable_home_score
  CHECK (home_score IS NULL OR home_score BETWEEN 0 AND 200);

ALTER TABLE games ADD CONSTRAINT reasonable_away_score
  CHECK (away_score IS NULL OR away_score BETWEEN 0 AND 200);

-- Ensure R69 score is always 69
ALTER TABLE r69_events ADD CONSTRAINT r69_score_check
  CHECK (score_at_69 = 69);

-- Ensure team IDs are not empty strings
ALTER TABLE games ADD CONSTRAINT non_empty_home_team_id
  CHECK (home_team_id IS NULL OR home_team_id != '');

ALTER TABLE games ADD CONSTRAINT non_empty_away_team_id
  CHECK (away_team_id IS NULL OR away_team_id != '');
```

### 3. Regular Data Quality Checks

Create a monitoring script that runs daily:

**File**: `scripts/daily-data-quality-check.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function dailyDataQualityCheck() {
  const issues = []

  // Check for duplicate team IDs
  const duplicates = await prisma.$queryRaw`
    SELECT home_team_name, COUNT(DISTINCT home_team_id) as id_count
    FROM games
    GROUP BY home_team_name
    HAVING COUNT(DISTINCT home_team_id) > 1
  `

  if (duplicates.length > 0) {
    issues.push(`${duplicates.length} teams with duplicate IDs`)
  }

  // Check for orphaned R69 events
  const orphaned = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM r69_events r
    WHERE NOT EXISTS (SELECT 1 FROM games g WHERE g.id = r.game_id)
  `

  if (orphaned[0].count > 0) {
    issues.push(`${orphaned[0].count} orphaned R69 events`)
  }

  // Report results
  if (issues.length > 0) {
    console.log('❌ Data quality issues detected:')
    issues.forEach(issue => console.log(`  - ${issue}`))
    // Send alert (email, Slack, etc.)
  } else {
    console.log('✅ All data quality checks passed')
  }
}

dailyDataQualityCheck()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
```

---

## Summary of Priority Actions

### Immediate (Do Now)
1. ✅ Fix season data (COMPLETED via fix-seasons.js)
2. 🔧 Fix duplicate team IDs (run fix-duplicate-team-ids.js)
3. 🔍 Validate R69 event integrity (run validate-r69-events.js)

### Short-term (This Week)
1. Identify and fix missing team IDs
2. Add database constraints to prevent future bad data
3. Set up data quality monitoring

### Long-term (Ongoing)
1. Improve logo coverage (find alternative sources)
2. Add data validation to ingestion pipeline
3. Create automated alerts for data quality issues
4. Document data quality SLAs and metrics

---

## Contact & Support

For questions about database cleanup or data quality:
- Check the data ingestion scripts in `/scripts`
- Review the Prisma schema in `/prisma/schema.prisma`
- Run diagnostic queries to identify specific issues

Last Updated: 2025-11-10
