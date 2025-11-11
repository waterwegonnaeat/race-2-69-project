#!/usr/bin/env node
/**
 * Analyze R69 statistics to generate better insights
 * This script analyzes the actual data to provide real insights
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 R69 STATISTICAL ANALYSIS')
  console.log('='.repeat(80))
  console.log('\n')

  try {
    // 1. Overall R69 Statistics
    console.log('1️⃣  OVERALL R69 STATISTICS')
    console.log('-'.repeat(80))

    const totalR69Events = await prisma.r69Event.count()
    const totalR69Wins = await prisma.r69Event.count({ where: { r69w: true } })
    const totalR69Losses = await prisma.r69Event.count({ where: { r69w: false } })
    const winRate = (totalR69Wins / totalR69Events * 100).toFixed(2)

    console.log(`Total R69 Events: ${totalR69Events.toLocaleString()}`)
    console.log(`R69 Wins: ${totalR69Wins.toLocaleString()} (${winRate}%)`)
    console.log(`R69 Losses: ${totalR69Losses.toLocaleString()} (${(100 - winRate).toFixed(2)}%)`)
    console.log('')

    // 2. Margin Analysis - Key Insight!
    console.log('2️⃣  MARGIN AT 69 ANALYSIS')
    console.log('-'.repeat(80))

    const marginStats = await prisma.$queryRaw`
      SELECT
        margin_range,
        COUNT(*) as total_games,
        SUM(CASE WHEN r69w = true THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(CASE WHEN r69w = true THEN 100.0 ELSE 0 END), 2) as win_rate
      FROM (
        SELECT
          CASE
            WHEN margin_at_69 < -15 THEN 'Down 15+'
            WHEN margin_at_69 BETWEEN -15 AND -11 THEN 'Down 11-15'
            WHEN margin_at_69 BETWEEN -10 AND -6 THEN 'Down 6-10'
            WHEN margin_at_69 BETWEEN -5 AND -1 THEN 'Down 1-5'
            WHEN margin_at_69 = 0 THEN 'Tied'
            WHEN margin_at_69 BETWEEN 1 AND 5 THEN 'Up 1-5'
            WHEN margin_at_69 BETWEEN 6 AND 10 THEN 'Up 6-10'
            WHEN margin_at_69 BETWEEN 11 AND 15 THEN 'Up 11-15'
            WHEN margin_at_69 > 15 THEN 'Up 15+'
          END as margin_range,
          r69w
        FROM r69_events
      ) as subquery
      GROUP BY margin_range
      ORDER BY
        CASE
          WHEN margin_range = 'Down 15+' THEN 1
          WHEN margin_range = 'Down 11-15' THEN 2
          WHEN margin_range = 'Down 6-10' THEN 3
          WHEN margin_range = 'Down 1-5' THEN 4
          WHEN margin_range = 'Tied' THEN 5
          WHEN margin_range = 'Up 1-5' THEN 6
          WHEN margin_range = 'Up 6-10' THEN 7
          WHEN margin_range = 'Up 11-15' THEN 8
          WHEN margin_range = 'Up 15+' THEN 9
        END
    `

    console.log('Margin Range       | Games | Wins | Win Rate')
    console.log('-'.repeat(55))
    marginStats.forEach(stat => {
      const range = stat.margin_range.padEnd(17)
      const games = String(stat.total_games).padStart(6)
      const wins = String(stat.wins).padStart(5)
      const rate = String(stat.win_rate).padStart(7) + '%'
      console.log(`${range} | ${games} | ${wins} | ${rate}`)
    })
    console.log('')

    // 3. Period Analysis
    console.log('3️⃣  PERIOD ANALYSIS')
    console.log('-'.repeat(80))

    const periodStats = await prisma.$queryRaw`
      SELECT
        period_at_69,
        COUNT(*) as total_games,
        SUM(CASE WHEN r69w = true THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(CASE WHEN r69w = true THEN 100.0 ELSE 0 END), 2) as win_rate,
        ROUND(AVG(margin_at_69), 2) as avg_margin
      FROM r69_events
      GROUP BY period_at_69
      ORDER BY period_at_69
    `

    console.log('Period | Games  | Wins   | Win Rate | Avg Margin')
    console.log('-'.repeat(55))
    periodStats.forEach(stat => {
      const period = String(stat.period_at_69).padStart(6)
      const games = String(stat.total_games).padStart(7)
      const wins = String(stat.wins).padStart(7)
      const rate = String(stat.win_rate).padStart(8) + '%'
      const margin = String(stat.avg_margin).padStart(10)
      console.log(`${period} | ${games} | ${wins} | ${rate} | ${margin}`)
    })
    console.log('')

    // 4. Time to 69 Analysis
    console.log('4️⃣  TIME TO 69 ANALYSIS (Speed Analysis)')
    console.log('-'.repeat(80))

    const timeStats = await prisma.$queryRaw`
      SELECT
        time_range,
        COUNT(*) as total_games,
        SUM(CASE WHEN r69w = true THEN 1 ELSE 0 END) as wins,
        ROUND(AVG(CASE WHEN r69w = true THEN 100.0 ELSE 0 END), 2) as win_rate,
        ROUND(AVG(margin_at_69), 2) as avg_margin
      FROM (
        SELECT
          CASE
            WHEN t_to_69 < 600 THEN '0-10 min'
            WHEN t_to_69 < 1200 THEN '10-20 min'
            WHEN t_to_69 < 1800 THEN '20-30 min'
            WHEN t_to_69 < 2400 THEN '30-40 min'
            ELSE '40+ min'
          END as time_range,
          r69w,
          margin_at_69
        FROM r69_events
      ) as subquery
      GROUP BY time_range
      ORDER BY
        CASE
          WHEN time_range = '0-10 min' THEN 1
          WHEN time_range = '10-20 min' THEN 2
          WHEN time_range = '20-30 min' THEN 3
          WHEN time_range = '30-40 min' THEN 4
          ELSE 5
        END
    `

    console.log('Time Range  | Games  | Wins   | Win Rate | Avg Margin')
    console.log('-'.repeat(60))
    timeStats.forEach(stat => {
      const range = stat.time_range.padEnd(11)
      const games = String(stat.total_games).padStart(7)
      const wins = String(stat.wins).padStart(7)
      const rate = String(stat.win_rate).padStart(8) + '%'
      const margin = String(stat.avg_margin).padStart(10)
      console.log(`${range} | ${games} | ${wins} | ${rate} | ${margin}`)
    })
    console.log('')

    // 5. Extreme Cases
    console.log('5️⃣  EXTREME CASES - Most Interesting Stats')
    console.log('-'.repeat(80))

    // Biggest comeback (trailing the most and still winning)
    const biggestComeback = await prisma.r69Event.findFirst({
      where: { r69w: true, marginAt69: { lt: 0 } },
      orderBy: { marginAt69: 'asc' },
      include: { game: true }
    })

    if (biggestComeback) {
      console.log(`🔥 Biggest Comeback Win:`)
      console.log(`   ${biggestComeback.teamName} was down ${Math.abs(biggestComeback.marginAt69)} when hitting 69 first`)
      console.log(`   vs ${biggestComeback.game.homeTeamName === biggestComeback.teamName ? biggestComeback.game.awayTeamName : biggestComeback.game.homeTeamName}`)
      console.log(`   Final margin: ${biggestComeback.finalMargin > 0 ? '+' : ''}${biggestComeback.finalMargin}`)
      console.log('')
    }

    // Biggest blown lead
    const biggestBlownLead = await prisma.r69Event.findFirst({
      where: { r69w: false, marginAt69: { gt: 0 } },
      orderBy: { marginAt69: 'desc' },
      include: { game: true }
    })

    if (biggestBlownLead) {
      console.log(`💔 Biggest Blown Lead:`)
      console.log(`   ${biggestBlownLead.teamName} was up ${biggestBlownLead.marginAt69} when hitting 69 first`)
      console.log(`   vs ${biggestBlownLead.game.homeTeamName === biggestBlownLead.teamName ? biggestBlownLead.game.awayTeamName : biggestBlownLead.game.homeTeamName}`)
      console.log(`   Final margin: ${biggestBlownLead.finalMargin}`)
      console.log('')
    }

    // Win rate when trailing
    const trailingWins = await prisma.r69Event.count({ where: { r69w: true, marginAt69: { lt: 0 } } })
    const trailingTotal = await prisma.r69Event.count({ where: { marginAt69: { lt: 0 } } })
    const trailingWinRate = (trailingWins / trailingTotal * 100).toFixed(2)

    console.log(`📊 Win Rate When Trailing:`)
    console.log(`   ${trailingWins} wins out of ${trailingTotal} games (${trailingWinRate}%)`)
    console.log(`   Key Insight: Even when behind, hitting 69 first gives a significant advantage!`)
    console.log('')

    // Win rate when leading
    const leadingWins = await prisma.r69Event.count({ where: { r69w: true, marginAt69: { gt: 0 } } })
    const leadingTotal = await prisma.r69Event.count({ where: { marginAt69: { gt: 0 } } })
    const leadingWinRate = (leadingWins / leadingTotal * 100).toFixed(2)

    console.log(`📊 Win Rate When Leading:`)
    console.log(`   ${leadingWins} wins out of ${leadingTotal} games (${leadingWinRate}%)`)
    console.log('')

    // Win rate when tied
    const tiedWins = await prisma.r69Event.count({ where: { r69w: true, marginAt69: 0 } })
    const tiedTotal = await prisma.r69Event.count({ where: { marginAt69: 0 } })
    const tiedWinRate = tiedTotal > 0 ? (tiedWins / tiedTotal * 100).toFixed(2) : '0'

    console.log(`📊 Win Rate When Tied:`)
    console.log(`   ${tiedWins} wins out of ${tiedTotal} games (${tiedWinRate}%)`)
    console.log('')

    console.log('='.repeat(80))
    console.log('✅ Analysis complete!')
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('\n❌ Error during analysis:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
