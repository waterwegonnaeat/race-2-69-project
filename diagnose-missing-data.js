const { prisma } = require('./db')

async function diagnoseMissingData() {
  try {
    console.log('DIAGNOSING MISSING DATA')
    console.log('==================================================')

    // 1. Check low-scoring games
    const lowScoringGames = await prisma.game.count({
      where: {
        AND: [
          { gameStatus: 'FINAL' },
          {
            OR: [
              { homeScore: { lt: 69 } },
              { awayScore: { lt: 69 } }
            ]
          }
        ]
      }
    })

    console.log('\nLow-Scoring Games:')
    console.log(`  Games where neither team reached 69: ${lowScoringGames}`)

    // 2. Check games with PBP but no R69
    const gamesWithPBPNoR69 = await prisma.game.count({
      where: {
        AND: [
          { gameStatus: 'FINAL' },
          { pbpEvents: { some: {} } },
          { r69Events: { none: {} } },
          {
            OR: [
              { homeScore: { gte: 69 } },
              { awayScore: { gte: 69 } }
            ]
          }
        ]
      }
    })

    console.log('\nMissing R69 Detection:')
    console.log(`  Games with PBP, score >=69, but NO R69 event: ${gamesWithPBPNoR69}`)

    // 3. Check games without PBP
    const gamesWithoutPBP = await prisma.game.count({
      where: {
        pbpEvents: { none: {} }
      }
    })

    console.log('\nMissing Play-by-Play:')
    console.log(`  Games without any PBP events: ${gamesWithoutPBP}`)

    // 4. Check recent games
    const recentGames = await prisma.game.findMany({
      where: {
        gameStatus: 'FINAL'
      },
      orderBy: {
        gameDate: 'desc'
      },
      take: 5,
      include: {
        r69Events: true,
        _count: {
          select: {
            pbpEvents: true
          }
        }
      }
    })

    console.log('\nRecent Final Games (sample):')
    recentGames.forEach((game, i) => {
      console.log(`  ${i+1}. ${game.homeTeamName} ${game.homeScore} - ${game.awayScore} ${game.awayTeamName}`)
      console.log(`     Date: ${game.gameDate.toISOString().split('T')[0]}`)
      console.log(`     PBP Events: ${game._count.pbpEvents}`)
      console.log(`     R69 Events: ${game.r69Events.length}`)
    })

    // 5. Check for orphaned R69 events
    const totalGames = await prisma.game.count()
    const totalR69 = await prisma.r69Event.count()

    console.log('\nOverall Statistics:')
    console.log(`  Total Games: ${totalGames}`)
    console.log(`  Total R69 Events: ${totalR69}`)
    console.log(`  Avg R69 per game: ${(totalR69/totalGames).toFixed(2)}`)
    console.log(`  Expected: ~1.17 R69 events per game`)

    // 6. Identify data quality issues
    console.log('\nDATA QUALITY SUMMARY:')
    console.log(`  OK: ${lowScoringGames} (neither team reached 69)`)
    console.log(`  WARNING: ${gamesWithPBPNoR69} (have PBP, missing R69)`)
    console.log(`  ERROR: ${gamesWithoutPBP} (no PBP data at all)`)

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseMissingData()
