# R69 Detection Algorithm Fix

**Date**: November 9, 2025
**Status**: ✅ Fixed

---

## Problem Identified

The original R69 detection algorithm had a **critical flaw** that missed valid R69 events.

### Original (Incorrect) Logic

```python
# Check if home team hit 69 first while leading
if home_score == 69 and home_score > away_score:
    return R69Event(...)
```

**Issue**: This only detected R69 events when the team was **leading at the moment they hit 69**.

### Edge Case Example

**Scenario**:
- Team A: 67 points
- Team B: 68 points (leading)
- Team A scores → 69 points (now leading)

**Problem**: Team A hit 69 **first** but wasn't leading immediately before. The old algorithm would **miss this event** because it required `home_score > away_score` at the exact moment of hitting 69.

---

## Solution

### Corrected Logic

```python
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
            return create_r69_event(home_team_id, ...)

        # Check if away team hit 69 first (regardless of whether leading)
        if away_score >= 69 and not away_hit_69 and not home_hit_69:
            away_hit_69 = True
            return create_r69_event(away_team_id, ...)

    return None
```

**Key Changes**:
1. Track `home_hit_69` and `away_hit_69` flags
2. Remove the `home_score > away_score` requirement
3. Only check that opponent hasn't reached 69 yet (`away_score < 69`)
4. Return immediately when first team hits 69

---

## Files Modified

### Data Pipeline Scripts
1. **[scripts/fetch_historical_data.py](../scripts/fetch_historical_data.py)**
   - Line 65-110: Updated `detect_r69_event()` function

2. **[scripts/fetch_arkansas_games.py](../scripts/fetch_arkansas_games.py)**
   - Line 66-111: Updated `detect_r69_event()` function

### Documentation Updates
3. **[app/page.tsx](../app/page.tsx)**
   - Line 92: Removed "while leading" from subtitle

4. **[README.md](../README.md)**
   - Line 11: Updated description
   - Line 65: Updated "Nice Games" description

5. **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)**
   - Line 11: Updated R69W phenomenon description

6. **[R69W_ARCHITECTURE.md](../R69W_ARCHITECTURE.md)**
   - Line 8: Updated executive summary
   - Line 234: Updated docstring
   - Line 246: Removed leading requirement from example code

---

## Impact Analysis

### Positive Impacts
- **More Accurate**: Now captures all R69 events, not just leading ones
- **Better Statistics**: Win rate data will be more comprehensive
- **Correct Phenomenon**: Properly tracks "first to 69" regardless of score differential

### Potential Changes
- **R69 Event Count**: May increase (previously missed events now detected)
- **Win Rate %**: May change slightly (73.2% baseline may shift)
- **Historical Data**: Requires re-processing to capture missed events

---

## Testing Recommendations

### 1. Verify Algorithm with Test Cases

```python
# Test Case 1: Team leads when hitting 69 (should detect)
plays = [
    {'homeScore': 67, 'awayScore': 65},
    {'homeScore': 69, 'awayScore': 65},  # Home hits 69 while leading
]
# Expected: R69 event for home team

# Test Case 2: Team trails when hitting 69 (should also detect)
plays = [
    {'homeScore': 67, 'awayScore': 68},
    {'homeScore': 69, 'awayScore': 68},  # Home hits 69 while trailing
]
# Expected: R69 event for home team (NEW - old algo missed this)

# Test Case 3: Both teams over 69 (should detect first)
plays = [
    {'homeScore': 69, 'awayScore': 67},  # Home hits 69 first
    {'homeScore': 69, 'awayScore': 69},  # Away catches up
]
# Expected: R69 event for home team only
```

### 2. Re-process Historical Data

To get accurate statistics with the new algorithm:

```bash
cd scripts
python fetch_historical_data.py
# Select option 6 (10 seasons)
```

This will re-detect all R69 events with the corrected logic.

---

## Correct Terminology

### Before (Incorrect)
> "Teams that reach 69 points first **while leading** have a 73% win rate"

### After (Correct)
> "Teams that reach 69 points **first** have a 73% win rate"

---

## Technical Notes

### Why Use `>=` Instead of `==`?

```python
if home_score >= 69 and not home_hit_69 and not away_hit_69:
```

**Reason**: Play-by-play data may skip exact scores (e.g., 67 → 70 on a 3-pointer). Using `>=` ensures we don't miss events.

### Why Track Both Flags?

```python
home_hit_69 = False
away_hit_69 = False
```

**Reason**: Prevents double-counting and ensures we only detect the **first** team to reach 69.

---

## Conclusion

This fix ensures the R69 detection algorithm correctly implements the intended behavior: tracking which team reaches 69 points **first**, regardless of whether they were leading at that exact moment.

The corrected algorithm now properly handles edge cases like come-from-behind 69s, where a team catches up to 69 without previously leading.

---

**Fixed By**: Claude Code
**Date**: November 9, 2025
**Related Issue**: User-reported edge case (Team A: 67 → 69, Team B: 68)
