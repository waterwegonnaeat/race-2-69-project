const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  const teamName = "Arkansas Razorbacks";
  const seasons = ["2025-26"];
  
  // Build where clause exactly as API does
  const where = {
    OR: [
      { homeTeamName: { equals: teamName, mode: 'insensitive' } },
      { awayTeamName: { equals: teamName, mode: 'insensitive' } },
    ],
  };

  // Add season filter with date validation
  if (seasons.length > 0) {
    where.season = { in: seasons };

    // Date range filtering (lines 28-47 from API)
    const dateRanges = seasons.map(season => {
      const [startYear, endYear] = season.split('-').map(y =>
        y.length === 2 ? `20${y}` : y
      );
      return {
        startDate: new Date(`${startYear}-11-01`),
        endDate: new Date(`${endYear}-04-30`)
      };
    });

    where.AND = where.AND || [];
    where.AND.push({
      OR: dateRanges.map(({ startDate, endDate }) => ({
        gameDate: {
          gte: startDate,
          lte: endDate
        }
      }))
    });
  }

  console.log('\n=== Query Filter ===\n');
  console.log(JSON.stringify(where, null, 2));

  const games = await prisma.game.findMany({
    where,
    select: {
      gameDate: true,
      season: true,
      homeTeamName: true,
      awayTeamName: true,
      homeScore: true,
      awayScore: true
    },
    orderBy: {
      gameDate: 'asc'
    }
  });

  console.log(`\n=== Query Results (${games.length} games) ===\n`);
  games.forEach(game => {
    const dateStr = game.gameDate.toISOString().split('T')[0];
    console.log(`${dateStr} | Season: "${game.season}" | ${game.homeTeamName} vs ${game.awayTeamName}`);
  });

  // Now test without date filtering
  console.log('\n\n=== Test WITHOUT Date Filter ===\n');
  const gamesNoDateFilter = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamName: { equals: teamName, mode: 'insensitive' } },
        { awayTeamName: { equals: teamName, mode: 'insensitive' } },
      ],
      season: { in: seasons }
    },
    select: {
      gameDate: true,
      season: true,
      homeTeamName: true,
      awayTeamName: true
    },
    orderBy: {
      gameDate: 'asc'
    }
  });

  console.log(`Found ${gamesNoDateFilter.length} games with season "2025-26" (no date filter):\n`);
  gamesNoDateFilter.forEach(game => {
    const dateStr = game.gameDate.toISOString().split('T')[0];
    console.log(`${dateStr} | ${game.homeTeamName} vs ${game.awayTeamName}`);
  });
}

testQuery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
