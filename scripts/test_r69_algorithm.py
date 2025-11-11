#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify R69 detection algorithm handles edge cases correctly.

This script tests the corrected R69 detection algorithm against various scenarios,
including the edge case where a team reaches 69 first without previously leading.
"""
import sys
import io

# Fix Windows console encoding issues
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def calculate_elapsed_time(period_num, clock_display):
    """Calculate elapsed time in seconds (simplified)"""
    return 1200  # Dummy value for testing

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
            return {
                'team_id': home_team_id,
                'team_is_home': True,
                'margin_at_69': home_score - away_score,
                'opponent_score': away_score,
            }

        # Check if away team hit 69 first (regardless of whether leading)
        if away_score >= 69 and not away_hit_69 and not home_hit_69:
            away_hit_69 = True
            return {
                'team_id': away_team_id,
                'team_is_home': False,
                'margin_at_69': away_score - home_score,
                'opponent_score': home_score,
            }

    return None


def test_case_1_leading():
    """Test Case 1: Team hits 69 while leading (should detect)"""
    plays = [
        {'homeScore': 65, 'awayScore': 63},
        {'homeScore': 67, 'awayScore': 65},
        {'homeScore': 69, 'awayScore': 65},  # Home hits 69 while leading
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event"
    assert result['team_id'] == 'home_team', "Home team should have R69 event"
    assert result['margin_at_69'] == 4, "Margin should be +4"
    print("✅ Test Case 1 PASSED: Team hits 69 while leading")


def test_case_2_trailing_edge_case():
    """Test Case 2: Team hits 69 while trailing (EDGE CASE - should still detect)"""
    plays = [
        {'homeScore': 65, 'awayScore': 66},
        {'homeScore': 67, 'awayScore': 68},  # Home trailing by 1
        {'homeScore': 69, 'awayScore': 68},  # Home hits 69 first, now leading
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event (CRITICAL FIX)"
    assert result['team_id'] == 'home_team', "Home team should have R69 event"
    assert result['margin_at_69'] == 1, "Margin should be +1 (now leading)"
    print("✅ Test Case 2 PASSED: Edge case - team hits 69 while previously trailing")


def test_case_3_both_over_69():
    """Test Case 3: Both teams over 69 (should detect first team only)"""
    plays = [
        {'homeScore': 67, 'awayScore': 65},
        {'homeScore': 69, 'awayScore': 67},  # Home hits 69 first
        {'homeScore': 71, 'awayScore': 69},  # Away catches up to 69
        {'homeScore': 73, 'awayScore': 72},
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event"
    assert result['team_id'] == 'home_team', "Home team hit 69 first"
    assert result['margin_at_69'] == 2, "Margin should be +2"
    print("✅ Test Case 3 PASSED: First team to 69 detected, second ignored")


def test_case_4_away_team_first():
    """Test Case 4: Away team hits 69 first"""
    plays = [
        {'homeScore': 65, 'awayScore': 67},
        {'homeScore': 67, 'awayScore': 69},  # Away hits 69 first
        {'homeScore': 69, 'awayScore': 71},
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event"
    assert result['team_id'] == 'away_team', "Away team should have R69 event"
    assert result['margin_at_69'] == 2, "Margin should be +2"
    print("✅ Test Case 4 PASSED: Away team hits 69 first")


def test_case_5_no_r69_event():
    """Test Case 5: No team reaches 69 (should not detect)"""
    plays = [
        {'homeScore': 55, 'awayScore': 53},
        {'homeScore': 58, 'awayScore': 56},
        {'homeScore': 62, 'awayScore': 60},
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is None, "Should NOT detect R69 event"
    print("✅ Test Case 5 PASSED: No R69 event when neither team reaches 69")


def test_case_6_tied_at_68():
    """Test Case 6: Teams tied at 68, home reaches 69 first"""
    plays = [
        {'homeScore': 65, 'awayScore': 65},  # Tied
        {'homeScore': 68, 'awayScore': 68},  # Still tied
        {'homeScore': 69, 'awayScore': 68},  # Home breaks tie at 69
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event"
    assert result['team_id'] == 'home_team', "Home team should have R69 event"
    assert result['margin_at_69'] == 1, "Margin should be +1"
    print("✅ Test Case 6 PASSED: Team breaks tie by reaching 69 first")


def test_case_7_jump_to_70():
    """Test Case 7: Team scores 3-pointer to jump from 67 to 70 (>=69 check)"""
    plays = [
        {'homeScore': 65, 'awayScore': 67},
        {'homeScore': 67, 'awayScore': 68},
        {'homeScore': 70, 'awayScore': 68},  # Home jumps to 70 (3-pointer)
    ]
    result = detect_r69_event(plays, 'home_team', 'away_team')

    assert result is not None, "Should detect R69 event (>=69)"
    assert result['team_id'] == 'home_team', "Home team should have R69 event"
    assert result['margin_at_69'] == 2, "Margin should be +2"
    print("✅ Test Case 7 PASSED: Jump to 70 detected via >= operator")


if __name__ == '__main__':
    print("=" * 70)
    print("R69 Detection Algorithm - Test Suite")
    print("Testing corrected algorithm (removed 'while leading' requirement)")
    print("=" * 70)
    print()

    try:
        test_case_1_leading()
        test_case_2_trailing_edge_case()
        test_case_3_both_over_69()
        test_case_4_away_team_first()
        test_case_5_no_r69_event()
        test_case_6_tied_at_68()
        test_case_7_jump_to_70()

        print()
        print("=" * 70)
        print("🎉 ALL TESTS PASSED! R69 algorithm is working correctly.")
        print("=" * 70)
        print()
        print("Key Verification:")
        print("✅ Detects R69 when team is leading")
        print("✅ Detects R69 when team was trailing (CRITICAL FIX)")
        print("✅ Only detects first team to reach 69")
        print("✅ Handles 3-pointers (>=69 operator)")
        print("✅ Correctly ignores games without R69 events")

    except AssertionError as e:
        print()
        print("=" * 70)
        print(f"❌ TEST FAILED: {e}")
        print("=" * 70)
        exit(1)
