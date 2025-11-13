#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the DATABASE_URL connection string with Prisma
 */

const { PrismaClient } = require('@prisma/client')

// Use environment variable or command line argument
const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL provided!')
  console.error('')
  console.error('Usage:')
  console.error('  node scripts/test-db-connection.js "postgresql://..."')
  console.error('  Or set DATABASE_URL environment variable')
  process.exit(1)
}

console.log('🔍 Testing Database Connection...\n')
console.log('Connection String:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'))
console.log('---\n')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  const startTime = Date.now()

  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Basic Connection Test (SELECT 1)')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Basic connection successful')
    console.log('   Result:', result)
    console.log('')

    // Test 2: Check if games table exists
    console.log('Test 2: Check Games Table')
    const gameCount = await prisma.game.count()
    console.log('✅ Games table accessible')
    console.log(`   Total games in database: ${gameCount}`)
    console.log('')

    // Test 3: Sample query (like the search endpoint does)
    console.log('Test 3: Sample Search Query')
    const sampleGames = await prisma.game.findMany({
      where: {
        OR: [
          {
            homeTeamName: {
              contains: 'Houston',
              mode: 'insensitive',
            },
          },
          {
            awayTeamName: {
              contains: 'Houston',
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        homeTeamId: true,
        homeTeamName: true,
        awayTeamId: true,
        awayTeamName: true,
      },
      take: 5,
    })
    console.log('✅ Search query successful')
    console.log(`   Found ${sampleGames.length} games matching "Houston"`)
    if (sampleGames.length > 0) {
      console.log('   Sample:', sampleGames[0].homeTeamName, 'vs', sampleGames[0].awayTeamName)
    }
    console.log('')

    // Test 4: Connection pool test (multiple concurrent queries)
    console.log('Test 4: Connection Pool Test (5 concurrent queries)')
    const poolStart = Date.now()
    await Promise.all([
      prisma.$queryRaw`SELECT 1`,
      prisma.$queryRaw`SELECT 2`,
      prisma.$queryRaw`SELECT 3`,
      prisma.$queryRaw`SELECT 4`,
      prisma.$queryRaw`SELECT 5`,
    ])
    const poolTime = Date.now() - poolStart
    console.log('✅ Connection pool test successful')
    console.log(`   Completed 5 concurrent queries in ${poolTime}ms`)
    console.log('')

    const totalTime = Date.now() - startTime
    console.log('---')
    console.log(`✅ All tests passed! Total time: ${totalTime}ms`)
    console.log('')
    console.log('Connection is working correctly for Vercel deployment! 🎉')

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('---')
    console.error(`❌ Connection test failed after ${totalTime}ms`)
    console.error('')
    console.error('Error details:')
    console.error('  Type:', error.constructor.name)
    console.error('  Message:', error.message)
    console.error('')

    if (error.message.includes('connect')) {
      console.error('💡 This appears to be a connection error.')
      console.error('   Possible causes:')
      console.error('   - Database server is not accessible')
      console.error('   - Firewall blocking the connection')
      console.error('   - Invalid hostname or port')
      console.error('   - Database credentials are incorrect')
    } else if (error.message.includes('auth')) {
      console.error('💡 This appears to be an authentication error.')
      console.error('   - Check username and password')
      console.error('   - Ensure the user has proper permissions')
    } else if (error.message.includes('timeout')) {
      console.error('💡 This appears to be a timeout error.')
      console.error('   - Database may be slow to respond')
      console.error('   - Consider increasing pool_timeout parameter')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the test
testConnection()
