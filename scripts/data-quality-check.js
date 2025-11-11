const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function comprehensiveDataQualityCheck() {
  console.log('📊 Comprehensive Data Quality Check\n')
  console.log('='.repeat(50))
  console.log()

  try {
    // Run the comprehensive diagnostic query
    const results = await prisma.$queryRaw`
      SELECT
        'Total Games' as metric,
        COUNT(*)::text as value
      FROM games

      UNION ALL

      SELECT
        'Games with Missing Team IDs',
        COUNT(*)::text
      FROM games
      WHERE home_team_id IS NULL OR home_team_id = ''
         OR away_team_id IS NULL OR away_team_id = ''

      UNION ALL

      SELECT
        'Games with Missing Scores',
        COUNT(*)::text
      FROM games
      WHERE (home_score IS NULL OR away_score IS NULL)
        AND game_status = 'final'

      UNION ALL

      SELECT
        'R69 Events',
        COUNT(*)::text
      FROM r69_events

      UNION ALL

      SELECT
        'Teams with Logos',
        COUNT(DISTINCT home_team_id)::text
      FROM games
      WHERE home_team_logo IS NOT NULL

      UNION ALL

      SELECT
        'Total Unique Teams',
        COUNT(DISTINCT home_team_id)::text
      FROM games
      WHERE home_team_id IS NOT NULL

      UNION ALL

      SELECT
        'Seasons in Database',
        COUNT(DISTINCT season)::text
      FROM games
    `

    console.log('Overall Statistics:')
    console.log('-'.repeat(50))
    results.forEach(row => {
      console.log(`  ${row.metric.padEnd(35)} ${row.value}`)
    })
    console.log()

    // Check for duplicate team IDs
    console.log('Checking for Duplicate Team IDs...')
    console.log('-'.repeat(50))
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
      LIMIT 10
    `

    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} teams with duplicate IDs:`)
      duplicates.forEach(d => {
        console.log(`  - ${d.home_team_name}: IDs ${d.team_ids}`)
      })
    } else {
      console.log('✅ No duplicate team IDs found')
    }
    console.log()

    console.log('✅ Data quality check complete!')
  } catch (error) {
    console.error('Error running data quality check:', error)
    throw error
  }
}

comprehensiveDataQualityCheck()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
