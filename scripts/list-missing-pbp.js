const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Load prisma from parent directory
const prisma = new PrismaClient()

async function listMissingPBP() {
  try {
    console.log('Finding games without PBP data...\n')

    // Get games without PBP
    const gamesWithoutPBP = await prisma.game.findMany({
      where: {
        pbpEvents: {
          none: {}
        },
        gameStatus: 'FINAL'
      },
      orderBy: {
        gameDate: 'desc'
      },
      take: 20,
      select: {
        gameId: true,
        gameDate: true,
        homeTeamName: true,
        awayTeamName: true,
        homeScore: true,
        awayScore: true,
        season: true
      }
    })

    const totalCount = await prisma.game.count({
      where: {
        pbpEvents: {
          none: {}
        }
      }
    })

    console.log(`Total games without PBP: ${totalCount}`)
    console.log(`\nShowing first 20:\n`)

    gamesWithoutPBP.forEach((game, i) => {
      console.log(`${i + 1}. ${game.homeTeamName} ${game.homeScore} - ${game.awayScore} ${game.awayTeamName}`)
      console.log(`   Date: ${game.gameDate.toISOString().split('T')[0]}, Season: ${game.season}`)
      console.log(`   ESPN ID: ${game.gameId}\n`)
    })

    console.log(`\nTo fetch PBP data for these games, run:`)
    console.log(`  cd scripts`)
    console.log(`  python fetch_missing_pbp.py`)

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listMissingPBP()
