import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample teams
  const duke = await prisma.team.upsert({
    where: { teamId_season: { teamId: 'duke', season: '2024-25' } },
    update: {},
    create: {
      teamId: 'duke',
      teamName: 'Duke',
      conference: 'ACC',
      league: 'MENS',
      season: '2024-25',
      gamesPlayed: 15,
      r69Wins: 10,
      r69Losses: 2,
      avgTTo69: 1650.5,
      avgMarginAt69: 8.2,
    },
  })

  const unc = await prisma.team.upsert({
    where: { teamId_season: { teamId: 'unc', season: '2024-25' } },
    update: {},
    create: {
      teamId: 'unc',
      teamName: 'North Carolina',
      conference: 'ACC',
      league: 'MENS',
      season: '2024-25',
      gamesPlayed: 16,
      r69Wins: 9,
      r69Losses: 3,
      avgTTo69: 1720.3,
      avgMarginAt69: 6.5,
    },
  })

  const kansas = await prisma.team.upsert({
    where: { teamId_season: { teamId: 'kansas', season: '2024-25' } },
    update: {},
    create: {
      teamId: 'kansas',
      teamName: 'Kansas',
      conference: 'Big 12',
      league: 'MENS',
      season: '2024-25',
      gamesPlayed: 14,
      r69Wins: 11,
      r69Losses: 1,
      avgTTo69: 1580.0,
      avgMarginAt69: 9.8,
    },
  })

  const kentucky = await prisma.team.upsert({
    where: { teamId_season: { teamId: 'kentucky', season: '2024-25' } },
    update: {},
    create: {
      teamId: 'kentucky',
      teamName: 'Kentucky',
      conference: 'SEC',
      league: 'MENS',
      season: '2024-25',
      gamesPlayed: 15,
      r69Wins: 8,
      r69Losses: 4,
      avgTTo69: 1850.0,
      avgMarginAt69: 5.2,
    },
  })

  console.log('✅ Created sample teams')

  // Create sample game 1 - R69W (Duke wins)
  const game1 = await prisma.game.create({
    data: {
      gameId: 'sample-game-1',
      gameDate: new Date(),
      season: '2024-25',
      league: 'MENS',
      homeTeamId: 'duke',
      awayTeamId: 'unc',
      homeTeamName: 'Duke',
      awayTeamName: 'North Carolina',
      homeConference: 'ACC',
      awayConference: 'ACC',
      venue: 'Cameron Indoor Stadium',
      gameType: 'CONFERENCE',
      homeScore: 82,
      awayScore: 75,
      finalMargin: 7,
      gameStatus: 'FINAL',
      totalPeriods: 2,
      overtimeFlag: false,
    },
  })

  await prisma.r69Event.create({
    data: {
      gameId: game1.id,
      teamId: 'duke',
      teamName: 'Duke',
      tTo69: 1620,
      periodAt69: 2,
      marginAt69: 8,
      scoreAt69Team: 69,
      scoreAt69Opponent: 61,
      r69w: true,
      finalMargin: 7,
      playDescription: 'Jeremy Roach made layup',
    },
  })

  await prisma.r69Analytics.create({
    data: {
      gameId: game1.id,
      r69PaceIndex: 1.2,
      r69LeadDuration: 780,
      r69SwingMargin: -1,
      comeback69L: false,
      niceScore: false,
      doubleNice: true,
      homePossessions: 68,
      awayPossessions: 66,
      paceRating: 72.5,
    },
  })

  console.log('✅ Created game 1 (R69W - Duke wins)')

  // Create sample game 2 - Premature69 (Team that hit 69 first lost)
  const game2 = await prisma.game.create({
    data: {
      gameId: 'sample-game-2',
      gameDate: new Date(),
      season: '2024-25',
      league: 'MENS',
      homeTeamId: 'kansas',
      awayTeamId: 'kentucky',
      homeTeamName: 'Kansas',
      awayTeamName: 'Kentucky',
      homeConference: 'Big 12',
      awayConference: 'SEC',
      venue: 'Allen Fieldhouse',
      gameType: 'REGULAR',
      homeScore: 74,
      awayScore: 78,
      finalMargin: -4,
      gameStatus: 'FINAL',
      totalPeriods: 2,
      overtimeFlag: false,
    },
  })

  await prisma.r69Event.create({
    data: {
      gameId: game2.id,
      teamId: 'kansas',
      teamName: 'Kansas',
      tTo69: 1450,
      periodAt69: 2,
      marginAt69: 12,
      scoreAt69Team: 69,
      scoreAt69Opponent: 57,
      r69w: false,
      finalMargin: -4,
      playDescription: 'Dajuan Harris made three point jumper',
    },
  })

  await prisma.r69Analytics.create({
    data: {
      gameId: game2.id,
      r69PaceIndex: 1.35,
      r69LeadDuration: 420,
      r69SwingMargin: -16,
      comeback69L: false,
      niceScore: false,
      doubleNice: false,
      homePossessions: 71,
      awayPossessions: 69,
      paceRating: 75.8,
    },
  })

  console.log('✅ Created game 2 (Premature69 - Kansas lost after hitting 69 first)')

  // Create live game
  const liveGame = await prisma.game.create({
    data: {
      gameId: 'sample-game-live',
      gameDate: new Date(),
      season: '2024-25',
      league: 'MENS',
      homeTeamId: 'duke',
      awayTeamId: 'kansas',
      homeTeamName: 'Duke',
      awayTeamName: 'Kansas',
      homeConference: 'ACC',
      awayConference: 'Big 12',
      venue: 'Cameron Indoor Stadium',
      gameType: 'REGULAR',
      homeScore: 54,
      awayScore: 48,
      gameStatus: 'IN_PROGRESS',
      totalPeriods: 2,
      overtimeFlag: false,
    },
  })

  console.log('✅ Created live game (in progress)')

  // Create some play-by-play events for the live game
  for (let i = 1; i <= 10; i++) {
    await prisma.pBPEvent.create({
      data: {
        gameId: liveGame.id,
        sequenceNumber: i,
        period: 2,
        clockSeconds: 1200 - i * 60,
        elapsedSeconds: 1200 + i * 60,
        teamId: i % 2 === 0 ? 'duke' : 'kansas',
        playerName: `Player ${i}`,
        eventType: 'shot_made',
        pointsScored: 2,
        homeScore: 44 + i,
        awayScore: 40 + Math.floor(i * 0.8),
        description: `Made 2 point shot`,
      },
    })
  }

  console.log('✅ Created play-by-play events')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
