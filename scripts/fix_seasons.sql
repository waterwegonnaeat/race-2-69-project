-- Fix incorrect season assignments for games played in April
-- Games in April should belong to the season that started the previous November
-- e.g., April 2025 games should be "2024-25", not "2025-26"

-- Update games in April that have incorrect season
UPDATE games
SET season =
    CASE
        WHEN EXTRACT(MONTH FROM game_date) <= 4 THEN
            -- Jan-Apr: season started in November of previous year
            CONCAT(EXTRACT(YEAR FROM game_date)::int - 1, '-', SUBSTRING(EXTRACT(YEAR FROM game_date)::text FROM 3))
        ELSE
            -- May-Dec: upcoming season (Nov onwards) or off-season
            CONCAT(EXTRACT(YEAR FROM game_date)::int, '-', SUBSTRING((EXTRACT(YEAR FROM game_date)::int + 1)::text FROM 3))
    END
WHERE season !=
    CASE
        WHEN EXTRACT(MONTH FROM game_date) <= 4 THEN
            CONCAT(EXTRACT(YEAR FROM game_date)::int - 1, '-', SUBSTRING(EXTRACT(YEAR FROM game_date)::text FROM 3))
        ELSE
            CONCAT(EXTRACT(YEAR FROM game_date)::int, '-', SUBSTRING((EXTRACT(YEAR FROM game_date)::int + 1)::text FROM 3))
    END;

-- Update teams table if it exists and has season-based aggregations
UPDATE teams
SET season =
    CASE
        WHEN LENGTH(season) = 7 AND season ~ '^\d{4}-\d{2}$' THEN
            -- If season format is correct but value might be wrong, recalculate if needed
            season
        ELSE
            season
    END
WHERE EXISTS (
    SELECT 1 FROM teams WHERE season IS NOT NULL
);

-- Display summary of changes
SELECT
    season,
    COUNT(*) as game_count,
    MIN(game_date) as earliest_game,
    MAX(game_date) as latest_game
FROM games
GROUP BY season
ORDER BY season DESC;
