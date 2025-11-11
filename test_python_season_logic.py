from datetime import datetime

def determine_season(game_date_str):
    """Simulate the Python script's season determination logic (lines 126-135)"""
    game_date = datetime.strptime(game_date_str, '%Y-%m-%d').date()
    year = game_date.year
    month = game_date.month
    # If month is after August, it's the start of a new season
    if month >= 9:
        season = f"{year}-{str(year + 1)[2:]}"
    else:
        season = f"{year - 1}-{str(year)[2:]}"
    return season

# Test dates
test_dates = [
    '2024-12-04',  # December 2024
    '2025-01-15',  # January 2025
    '2025-03-05',  # March 2025
    '2025-11-04',  # November 2025
]

print('\n=== Python Season Assignment Logic ===\n')
for date_str in test_dates:
    season = determine_season(date_str)
    print(f'{date_str} -> Season: "{season}"')
