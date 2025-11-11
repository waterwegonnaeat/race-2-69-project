const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWrongSeasons() {
  // Find games where the season doesn't match the expected season based on date
  const allGames = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamName: { contains: 'Arkansas', mode: 'insensitive' } },
        { awayTeamName: { contains: 'Arkansas', mode: 'insensitive' } }
      ]
    },
    select: {
      gameId: true,
      gameDate: true,
      season: true,
      homeTeamName: true,
      awayTeamName: true
    },
    orderBy: {
      gameDate: 'desc'
    },
    take: 20
  });

  console.log('\n=== Arkansas Games - Season Validation ===\n');
  
  allGames.forEach(game => {
    const date = game.gameDate;
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Replicate Python logic
    let expectedSeason;
    if (month >= 9) {
      expectedSeason = `${year}-${String(year + 1).slice(-2)}`;
    } else {
      expectedSeason = `${year - 1}-${String(year).slice(-2)}`;
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const match = game.season === expectedSeason ? 'OK' : 'MISMATCH';
    const marker = match === 'MISMATCH' ? '*** ' : '    ';
    
    console.log(`${marker}${dateStr} | Stored: "${game.season}" | Expected: "${expectedSeason}" | ${match}`);
  });
}

checkWrongSeasons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
