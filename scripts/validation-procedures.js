const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function runValidationProcedures() {
  console.log('🔍 Running Validation Procedures...\n')
  console.log('='.repeat(60))
  console.log()

  // 1. Verify Team Count
  console.log('1. Verifying Team Count...')
  const teamCount = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT home_team_id) as unique_teams
    FROM games
    WHERE home_team_id IS NOT NULL AND home_team_id != ''
  `
  console.log(`   ✓ Unique teams: ${teamCount[0].unique_teams}`)
  console.log()

  // 2. Verify Logo Coverage
  console.log('2. Verifying Logo Coverage...')
  const logoCoverage = await prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT home_team_id) as teams_with_logos,
      (SELECT COUNT(DISTINCT home_team_id) FROM games WHERE home_team_id IS NOT NULL) as total_teams,
      ROUND(
        COUNT(DISTINCT home_team_id)::numeric /
        (SELECT COUNT(DISTINCT home_team_id) FROM games WHERE home_team_id IS NOT NULL) * 100,
        2
      ) as coverage_percentage
    FROM games
    WHERE home_team_logo IS NOT NULL
  `
  console.log(`   ✓ Teams with logos: ${logoCoverage[0].teams_with_logos}`)
  console.log(`   ✓ Total teams: ${logoCoverage[0].total_teams}`)
  console.log(`   ✓ Coverage: ${logoCoverage[0].coverage_percentage}%`)
  console.log()

  // 3. Verify Season Data
  console.log('3. Verifying Season Data (April games)...')
  const aprilGames = await prisma.$queryRaw`
    SELECT season, COUNT(*) as april_games
    FROM games
    WHERE EXTRACT(MONTH FROM game_date) = 4
    GROUP BY season
    ORDER BY season DESC
  `
  if (aprilGames.length > 0) {
    console.log('   April games by season:')
    aprilGames.forEach(row => {
      console.log(`     - ${row.season}: ${row.april_games} games`)
    })
  } else {
    console.log('   ✓ No April games found in database')
  }
  console.log()

  // 4. Verify R69 Integrity
  console.log('4. Verifying R69 Event Integrity...')
  const r69Integrity = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM r69_events) as total_r69_events,
      (SELECT COUNT(*) FROM r69_events r WHERE EXISTS (SELECT 1 FROM games g WHERE g.id = r.game_id)) as valid_r69_events
  `
  console.log(`   ✓ Total R69 events: ${r69Integrity[0].total_r69_events}`)
  console.log(`   ✓ Valid R69 events: ${r69Integrity[0].valid_r69_events}`)

  if (r69Integrity[0].total_r69_events === r69Integrity[0].valid_r69_events) {
    console.log('   ✓ All R69 events have matching games')
  } else {
    console.log(`   ❌ ${Number(r69Integrity[0].total_r69_events) - Number(r69Integrity[0].valid_r69_events)} orphaned R69 events found`)
  }
  console.log()

  // 5. Additional checks
  console.log('5. Additional Data Quality Checks...')

  // Check for games with extremely high scores
  const highScores = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM games
    WHERE home_score > 150 OR away_score > 150
  `
  console.log(`   ✓ Games with score > 150: ${highScores[0].count}`)

  // Check for tied games
  const tiedGames = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM games
    WHERE home_score = away_score
      AND home_score IS NOT NULL
      AND game_status = 'final'
  `
  console.log(`   ✓ Tied final games: ${tiedGames[0].count}`)

  // Check for games with suspicious dates
  const suspiciousDates = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM games
    WHERE EXTRACT(MONTH FROM game_date) IN (6, 7, 8, 9)
  `
  console.log(`   ✓ Games in summer months: ${suspiciousDates[0].count}`)

  console.log()
  console.log('='.repeat(60))
  console.log('✅ Validation procedures complete!')
}

runValidationProcedures()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
