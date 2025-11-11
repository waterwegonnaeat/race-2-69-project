import requests
import json

# Test with a specific Arkansas game
# Game ID from recent Arkansas game
game_id = "401489571"  # Arkansas vs someone

url = f"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={game_id}"

print(f"Fetching play-by-play for game {game_id}...")
response = requests.get(url)
data = response.json()

# Print structure
print("\nTop level keys:")
print(json.dumps(list(data.keys()), indent=2))

# Check for plays
if 'plays' in data:
    plays = data['plays']
    print(f"\nFound {len(plays)} plays")

    # Print first play structure
    if plays:
        print("\nFirst play structure:")
        print(json.dumps(plays[0], indent=2))

    # Look for a scoring play
    for idx, play in enumerate(plays):
        home_score = play.get('homeScore', 0)
        away_score = play.get('awayScore', 0)

        if home_score == 69 or away_score == 69:
            print(f"\n=== FOUND 69 SCORE at play #{idx} ===")
            print(f"Home: {home_score}, Away: {away_score}")
            print(json.dumps(play, indent=2))

            # Check if this is the FIRST time 69 was hit while leading
            if home_score == 69 and home_score > away_score:
                print(f"\n*** HOME TEAM HIT 69 FIRST WHILE LEADING ***")
                print(f"Margin: +{home_score - away_score}")
            elif away_score == 69 and away_score > home_score:
                print(f"\n*** AWAY TEAM HIT 69 FIRST WHILE LEADING ***")
                print(f"Margin: +{away_score - home_score}")
            break
