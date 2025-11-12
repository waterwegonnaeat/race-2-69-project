const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking Supabase database...\n');

    const gameCount = await prisma.game.count();
    const pbpCount = await prisma.pBPEvent.count();
    const r69Count = await prisma.r69Event.count();

    console.log('📊 Data Count:');
    console.log('  Games:', gameCount);
    console.log('  PBP Events:', pbpCount);
    console.log('  R69 Events:', r69Count);

    if (gameCount > 0) {
      // Get a sample game with PBP data
      const sampleGame = await prisma.game.findFirst({
        include: {
          pbpEvents: {
            take: 5
          },
          r69Event: true
        }
      });

      console.log('\n📋 Sample Game:');
      console.log('  ID:', sampleGame?.id);
      console.log('  Teams:', sampleGame?.homeTeamName, 'vs', sampleGame?.awayTeamName);
      console.log('  PBP Events for this game:', sampleGame?.pbpEvents?.length || 0);
      console.log('  Has R69 Event:', !!sampleGame?.r69Event);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
