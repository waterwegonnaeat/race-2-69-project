const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Testing local database connection...')

    const gameCount = await prisma.game.count()
    console.log('✓ Games in database:', gameCount)

    const r69Count = await prisma.r69Event.count()
    console.log('✓ R69 Events in database:', r69Count)

    const teamCount = await prisma.team.count()
    console.log('✓ Teams in database:', teamCount)

    if (gameCount > 0) {
      const sampleGame = await prisma.game.findFirst({
        select: {
          gameId: true,
          homeTeamName: true,
          awayTeamName: true,
          gameDate: true
        }
      })
      console.log('✓ Sample game:', sampleGame)
    }

  } catch (error) {
    console.error('✗ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
