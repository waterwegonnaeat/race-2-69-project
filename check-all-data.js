const { prisma } = require('./db')

async function checkAllData() {
  try {
    console.log('Checking all table counts...\n')

    const games = await prisma.game.count()
    const r69Events = await prisma.r69Event.count()
    const pbpEvents = await prisma.pBPEvent.count()
    const teams = await prisma.team.count()
    const analytics = await prisma.r69Analytics.count()

    console.log('📊 Database Counts:')
    console.log(`  Games:        ${games}`)
    console.log(`  R69 Events:   ${r69Events}`)
    console.log(`  PBP Events:   ${pbpEvents}`)
    console.log(`  Teams:        ${teams}`)
    console.log(`  Analytics:    ${analytics}`)

    // Check for games with/without R69 events
    const gamesWithR69 = await prisma.game.count({
      where: {
        r69Events: {
          some: {}
        }
      }
    })

    const gamesWithoutR69 = games - gamesWithR69

    console.log(`\n📈 R69 Coverage:`)
    console.log(`  Games with R69:    ${gamesWithR69} (${((gamesWithR69/games)*100).toFixed(1)}%)`)
    console.log(`  Games without R69: ${gamesWithoutR69} (${((gamesWithoutR69/games)*100).toFixed(1)}%)`)

    // Sample game with R69 event
    const gameWithR69 = await prisma.game.findFirst({
      where: {
        r69Events: {
          some: {}
        }
      },
      include: {
        r69Events: true
      }
    })

    if (gameWithR69) {
      console.log(`\n✅ Sample game WITH R69 event:`)
      console.log(`  ${gameWithR69.homeTeamName} vs ${gameWithR69.awayTeamName}`)
      console.log(`  Score: ${gameWithR69.homeScore}-${gameWithR69.awayScore}`)
      console.log(`  R69 Events: ${gameWithR69.r69Events.length}`)
    }

    // Sample game without R69 event
    const gameWithoutR69 = await prisma.game.findFirst({
      where: {
        r69Events: {
          none: {}
        },
        gameStatus: 'FINAL'
      }
    })

    if (gameWithoutR69) {
      console.log(`\n❌ Sample game WITHOUT R69 event:`)
      console.log(`  ${gameWithoutR69.homeTeamName} vs ${gameWithoutR69.awayTeamName}`)
      console.log(`  Score: ${gameWithoutR69.homeScore}-${gameWithoutR69.awayScore}`)
      console.log(`  Status: ${gameWithoutR69.gameStatus}`)
    }

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllData()
