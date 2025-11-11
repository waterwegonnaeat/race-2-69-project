const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixMissingTeamIds() {
  console.log('🔧 Finding and Fixing Missing Team IDs...\n')

  // Find games with missing team IDs
  const gamesWithMissingIds = await prisma.$queryRaw`
    SELECT id, game_id, game_date, home_team_name, home_team_id, away_team_name, away_team_id
    FROM games
    WHERE home_team_id IS NULL
       OR home_team_id = ''
       OR away_team_id IS NULL
       OR away_team_id = ''
  `

  console.log(`Found ${gamesWithMissingIds.length} games with missing team IDs\n`)

  if (gamesWithMissingIds.length === 0) {
    console.log('✅ No games with missing team IDs!')
    return
  }

  console.log('Games needing attention:')
  gamesWithMissingIds.forEach(game => {
    const homeId = game.home_team_id || 'MISSING'
    const awayId = game.away_team_id || 'MISSING'
    const dateStr = game.game_date instanceof Date ? game.game_date.toISOString().split('T')[0] : game.game_date
    console.log(`  - Game ${game.game_id} (${dateStr}): ${game.home_team_name} [${homeId}] vs ${game.away_team_name} [${awayId}]`)
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
