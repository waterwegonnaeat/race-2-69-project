#!/usr/bin/env node
/**
 * Fix incorrect season assignments in the database
 * Games in April should belong to the season that started the previous November
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🔧 FIXING SEASON DATA')
  console.log('='.repeat(80))
  console.log('\nUpdating games with incorrect season assignments...\n')

  try {
    // First, let's see what we have before the fix
    console.log('📊 Before fix:')
    const beforeStats = await prisma.$queryRaw`
      SELECT
        season,
        COUNT(*) as game_count,
        MIN(game_date) as earliest_game,
        MAX(game_date) as latest_game
      FROM games
      GROUP BY season
      ORDER BY season DESC
    `
    console.table(beforeStats)

    // Update games with incorrect seasons
    const result = await prisma.$executeRaw`
      UPDATE games
      SET season =
        CASE
          WHEN EXTRACT(MONTH FROM game_date) <= 4 THEN
            CONCAT(EXTRACT(YEAR FROM game_date)::int - 1, '-', LPAD(SUBSTRING((EXTRACT(YEAR FROM game_date)::int)::text FROM 3), 2, '0'))
          ELSE
            CONCAT(EXTRACT(YEAR FROM game_date)::int, '-', LPAD(SUBSTRING((EXTRACT(YEAR FROM game_date)::int + 1)::text FROM 3), 2, '0'))
        END,
        updated_at = NOW()
      WHERE season !=
        CASE
          WHEN EXTRACT(MONTH FROM game_date) <= 4 THEN
            CONCAT(EXTRACT(YEAR FROM game_date)::int - 1, '-', LPAD(SUBSTRING((EXTRACT(YEAR FROM game_date)::int)::text FROM 3), 2, '0'))
          ELSE
            CONCAT(EXTRACT(YEAR FROM game_date)::int, '-', LPAD(SUBSTRING((EXTRACT(YEAR FROM game_date)::int + 1)::text FROM 3), 2, '0'))
        END
    `

    console.log(`\n✅ Updated ${result} game(s) with correct season values\n`)

    // Show the results after the fix
    console.log('📊 After fix:')
    const afterStats = await prisma.$queryRaw`
      SELECT
        season,
        COUNT(*) as game_count,
        MIN(game_date) as earliest_game,
        MAX(game_date) as latest_game
      FROM games
      GROUP BY season
      ORDER BY season DESC
    `
    console.table(afterStats)

    // Show specific examples of April games to verify
    console.log('\n📅 Sample April games (verification):')
    const aprilGames = await prisma.$queryRaw`
      SELECT
        game_id,
        game_date,
        season,
        home_team_name,
        away_team_name
      FROM games
      WHERE EXTRACT(MONTH FROM game_date) = 4
      ORDER BY game_date DESC
      LIMIT 5
    `
    console.table(aprilGames)

    console.log('\n' + '='.repeat(80))
    console.log('✅ Season fix complete!')
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('\n❌ Error fixing seasons:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
