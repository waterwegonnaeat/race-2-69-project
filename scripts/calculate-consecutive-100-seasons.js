#!/usr/bin/env node
/**
 * Calculate teams with consecutive seasons of 100% R69W rate
 * Shows which teams have maintained a perfect R69W record across multiple consecutive seasons
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🏆 CONSECUTIVE 100% R69W RATE SEASONS ANALYSIS')
  console.log('='.repeat(80))
  console.log('\n')

  try {
    // Get all team season stats
    const teamSeasonStats = await prisma.$queryRaw`
      SELECT
        r.team_name,
        g.season,
        COUNT(*) as r69_events,
        SUM(CASE WHEN r.r69w = true THEN 1 ELSE 0 END) as r69_wins,
        ROUND(AVG(CASE WHEN r.r69w = true THEN 100.0 ELSE 0 END), 2) as win_rate
      FROM r69_events r
      JOIN games g ON r.game_id = g.id
      WHERE g.game_status = 'final'
      GROUP BY r.team_name, g.season
      HAVING COUNT(*) >= 3
      ORDER BY r.team_name, g.season
    `

    // Organize by team
    const teamData = {}
    for (const stat of teamSeasonStats) {
      if (!teamData[stat.team_name]) {
        teamData[stat.team_name] = []
      }
      teamData[stat.team_name].push({
        season: stat.season,
        events: Number(stat.r69_events),
        wins: Number(stat.r69_wins),
        winRate: parseFloat(stat.win_rate),
        perfect: parseFloat(stat.win_rate) === 100.0
      })
    }

    // Calculate consecutive perfect seasons
    const teamsWithConsecutive = []
    let maxConsecutive = 0

    for (const [teamName, seasons] of Object.entries(teamData)) {
      // Sort seasons chronologically
      seasons.sort((a, b) => {
        const [aStart] = a.season.split('-').map(y => parseInt(y))
        const [bStart] = b.season.split('-').map(y => parseInt(y))
        return aStart - bStart
      })

      let currentStreak = 0
      let maxStreak = 0
      let streakSeasons = []
      let currentStreakSeasons = []

      for (let i = 0; i < seasons.length; i++) {
        if (seasons[i].perfect) {
          currentStreak++
          currentStreakSeasons.push(seasons[i])

          if (currentStreak > maxStreak) {
            maxStreak = currentStreak
            streakSeasons = [...currentStreakSeasons]
          }
        } else {
          currentStreak = 0
          currentStreakSeasons = []
        }
      }

      if (maxStreak >= 2) {
        teamsWithConsecutive.push({
          teamName,
          maxStreak,
          streakSeasons
        })

        if (maxStreak > maxConsecutive) {
          maxConsecutive = maxStreak
        }
      }
    }

    // Sort by longest streak
    teamsWithConsecutive.sort((a, b) => b.maxStreak - a.maxStreak)

    console.log('1️⃣  TEAMS WITH CONSECUTIVE 100% R69W RATE SEASONS')
    console.log('-'.repeat(80))
    console.log(`Found ${teamsWithConsecutive.length} teams with 2+ consecutive perfect seasons`)
    console.log(`Maximum consecutive seasons: ${maxConsecutive}`)
    console.log('')

    if (teamsWithConsecutive.length > 0) {
      console.log('Team Name                          | Streak | Seasons')
      console.log('-'.repeat(80))

      teamsWithConsecutive.forEach(team => {
        const name = team.teamName.padEnd(34)
        const streak = String(team.maxStreak).padStart(6)
        const seasons = team.streakSeasons.map(s => s.season).join(', ')
        console.log(`${name} | ${streak} | ${seasons}`)
      })
      console.log('')

      // Show details for top streaks
      console.log('2️⃣  TOP STREAKS - DETAILED VIEW')
      console.log('-'.repeat(80))

      const topStreaks = teamsWithConsecutive.slice(0, 5)
      topStreaks.forEach((team, idx) => {
        console.log(`${idx + 1}. ${team.teamName} - ${team.maxStreak} consecutive seasons`)
        team.streakSeasons.forEach(season => {
          console.log(`   ${season.season}: ${season.wins}/${season.events} R69 events (100.0%)`)
        })
        console.log('')
      })
    } else {
      console.log('⚠️  No teams found with 2+ consecutive perfect seasons')
      console.log('    (Teams need at least 3 R69 events per season to qualify)')
      console.log('')
    }

    // Summary stats
    console.log('3️⃣  SUMMARY STATISTICS')
    console.log('-'.repeat(80))

    const perfectSeasons = teamSeasonStats.filter(s => parseFloat(s.win_rate) === 100.0)
    console.log(`Total perfect seasons (100% R69W): ${perfectSeasons.length}`)
    console.log(`Total teams analyzed: ${Object.keys(teamData).length}`)
    console.log(`Total team-seasons: ${teamSeasonStats.length}`)
    console.log(`Teams with consecutive perfection: ${teamsWithConsecutive.length}`)
    console.log('')

    // Return the max consecutive for use in the app
    console.log('='.repeat(80))
    console.log(`✅ Maximum Consecutive 100% Seasons: ${maxConsecutive}`)
    console.log('='.repeat(80) + '\n')

    return { maxConsecutive, teamsWithConsecutive, perfectSeasons: perfectSeasons.length }

  } catch (error) {
    console.error('\n❌ Error during analysis:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then((result) => {
    console.log('\n📊 Results ready for dashboard:')
    console.log(JSON.stringify(result, null, 2))
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
