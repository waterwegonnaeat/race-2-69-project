const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamName: { contains: 'Arkansas', mode: 'insensitive' } },
        { awayTeamName: { contains: 'Arkansas', mode: 'insensitive' } }
      ]
    },
    select: {
      gameDate: true,
      season: true,
      homeTeamName: true,
      awayTeamName: true,
      homeScore: true,
      awayScore: true
    },
    orderBy: {
      gameDate: 'desc'
    },
    take: 10
  });

  console.log('\n=== Recent Arkansas Games ===\n');
  games.forEach(game => {
    const dateStr = game.gameDate.toISOString().split('T')[0];
    console.log(`Date: ${dateStr} | Season: "${game.season}" | ${game.homeTeamName} ${game.homeScore} - ${game.awayScore} ${game.awayTeamName}`);
  });

  const uniqueSeasons = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamName: { contains: 'Arkansas', mode: 'insensitive' } },
        { awayTeamName: { contains: 'Arkansas', mode: 'insensitive' } }
      ]
    },
    distinct: ['season'],
    select: {
      season: true
    }
  });

  console.log('\n=== Unique Seasons for Arkansas ===\n');
  uniqueSeasons.forEach(s => console.log(`"${s.season}"`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
