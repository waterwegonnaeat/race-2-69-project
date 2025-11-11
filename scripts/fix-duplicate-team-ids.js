const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDuplicateTeamIds() {
  console.log('🔧 Fixing Duplicate Team IDs...\n')

  // First, detect any duplicates
  const duplicates = await prisma.$queryRaw`
    SELECT
      home_team_name,
      array_agg(DISTINCT home_team_id) as team_ids,
      COUNT(DISTINCT home_team_id) as id_count
    FROM games
    WHERE home_team_id IS NOT NULL
    GROUP BY home_team_name
    HAVING COUNT(DISTINCT home_team_id) > 1
    ORDER BY id_count DESC
  `

  if (duplicates.length === 0) {
    console.log('✅ No duplicate team IDs found! Database is clean.')
    return
  }

  console.log(`Found ${duplicates.length} teams with duplicate IDs:\n`)
  duplicates.forEach(d => {
    console.log(`  - ${d.home_team_name}: IDs ${d.team_ids}`)
  })
  console.log()

  // Team ID mappings (string -> numeric canonical ID)
  // Add mappings here as needed based on detection results
  const teamIdMappings = {
    'duke': '150',
    'kansas': '2305',
    'kentucky': '96',
  }

  let hasUpdates = false
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

    if (homeUpdated.count > 0 || awayUpdated.count > 0 || r69Updated.count > 0) {
      hasUpdates = true
      console.log(`  ✓ Updated ${homeUpdated.count} home games`)
      console.log(`  ✓ Updated ${awayUpdated.count} away games`)
      console.log(`  ✓ Updated ${r69Updated.count} R69 events\n`)
    }
  }

  if (hasUpdates) {
    console.log('✅ Duplicate Team IDs fixed!')
  } else {
    console.log('ℹ️  No updates needed. Duplicates may need manual mapping.')
  }
}

fixDuplicateTeamIds()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
