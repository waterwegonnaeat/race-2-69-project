const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function validateR69Events() {
  console.log('🔍 Validating R69 Event Data Integrity...\n')
  let issuesFound = false

  // Check for orphaned r69_events
  console.log('Checking for orphaned R69 events...')
  const orphanedEvents = await prisma.$queryRaw`
    SELECT r.id, r.game_id, r.team_name
    FROM r69_events r
    WHERE NOT EXISTS (
      SELECT 1 FROM games g WHERE g.id = r.game_id
    )
  `

  if (orphanedEvents.length > 0) {
    issuesFound = true
    console.log(`❌ Found ${orphanedEvents.length} orphaned R69 events:`)
    orphanedEvents.slice(0, 10).forEach(e => console.log(`  - Event ${e.id} for game ${e.game_id} (${e.team_name})`))
    if (orphanedEvents.length > 10) {
      console.log(`  ... and ${orphanedEvents.length - 10} more`)
    }
    console.log()
  } else {
    console.log('✅ No orphaned R69 events found\n')
  }

  // Check for mismatched team names
  console.log('Checking for mismatched team names...')
  const mismatchedNames = await prisma.$queryRaw`
    SELECT r.id, r.game_id, r.team_name, g.home_team_name, g.away_team_name
    FROM r69_events r
    JOIN games g ON g.id = r.game_id
    WHERE r.team_name != g.home_team_name
      AND r.team_name != g.away_team_name
  `

  if (mismatchedNames.length > 0) {
    issuesFound = true
    console.log(`❌ Found ${mismatchedNames.length} R69 events with mismatched team names:`)
    mismatchedNames.slice(0, 10).forEach(e => {
      console.log(`  - Event ${e.id}: R69 team "${e.team_name}" not in game (${e.home_team_name} vs ${e.away_team_name})`)
    })
    if (mismatchedNames.length > 10) {
      console.log(`  ... and ${mismatchedNames.length - 10} more`)
    }
    console.log()
  } else {
    console.log('✅ All R69 event team names match their games\n')
  }

  // Check for invalid scores
  console.log('Checking for invalid R69 scores...')
  const invalidScores = await prisma.$queryRaw`
    SELECT id, game_id, team_name, score_at_69_team
    FROM r69_events
    WHERE score_at_69_team != 69
  `

  if (invalidScores.length > 0) {
    issuesFound = true
    console.log(`❌ Found ${invalidScores.length} R69 events with score != 69:`)
    invalidScores.slice(0, 10).forEach(e => console.log(`  - Event ${e.id}: score=${e.score_at_69_team} (${e.team_name})`))
    if (invalidScores.length > 10) {
      console.log(`  ... and ${invalidScores.length - 10} more`)
    }
    console.log()
  } else {
    console.log('✅ All R69 events have correct score of 69\n')
  }

  // Check for games with multiple R69 events (should typically be 0 or 1, but could be 2+ in rare cases)
  console.log('Checking for games with multiple R69 events...')
  const multipleR69Events = await prisma.$queryRaw`
    SELECT game_id, COUNT(*) as event_count
    FROM r69_events
    GROUP BY game_id
    HAVING COUNT(*) > 2
  `

  if (multipleR69Events.length > 0) {
    console.log(`⚠️  Found ${multipleR69Events.length} games with more than 2 R69 events:`)
    multipleR69Events.slice(0, 10).forEach(e => console.log(`  - Game ${e.game_id}: ${e.event_count} R69 events`))
    if (multipleR69Events.length > 10) {
      console.log(`  ... and ${multipleR69Events.length - 10} more`)
    }
    console.log('  (Note: This may be valid in rare cases)\n')
  } else {
    console.log('✅ No games with unusual number of R69 events\n')
  }

  // Summary
  console.log('='.repeat(50))
  if (issuesFound) {
    console.log('⚠️  Validation complete - issues found (see above)')
  } else {
    console.log('✅ Validation complete - all R69 event data is valid!')
  }
}

validateR69Events()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
