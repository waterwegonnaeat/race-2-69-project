# NCAA Basketball Data Sources - Historical Coverage (10-20 Years)

## Current Data Source

### ESPN API (Currently Used)
- **Coverage**: 2002-present (~23 years)
- **Cost**: Free (no API key required)
- **Data Available**:
  - Game scores, schedules, rosters
  - Play-by-play data
  - Team and player statistics
  - Conference information
- **Rate Limits**: None documented, but use reasonable delays (0.5-1s between requests)
- **Quality**: Excellent - official data from ESPN
- **Endpoints**:
  - Scoreboard: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=YYYYMMDD`
  - Game Summary (with PBP): `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={game_id}`
  - Team Schedule: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{team_id}/schedule?season={year}`

**Recommendation**: Continue using ESPN API as primary source - it's free, reliable, and has 20+ years of data.

---

## Additional Free Data Sources

### 1. CBBpy (Python Package)
- **Coverage**: 2002-present (depends on ESPN data availability)
- **Cost**: Free, open source
- **GitHub**: https://github.com/saiemgilani/cbbpy
- **PyPI**: https://pypi.org/project/CBBpy/
- **Data Available**:
  - Play-by-play data
  - Box scores
  - Game metadata
  - Team schedules
  - Player statistics
- **Installation**: `pip install CBBpy`
- **Advantages**:
  - Python-native interface
  - Returns pandas DataFrames
  - Actively maintained (part of sportsdataverse)
- **Use Case**: Can supplement ESPN API or serve as backup source

### 2. NCAA API (Free Public API)
- **GitHub**: https://github.com/henrygd/ncaa-api
- **API Endpoint**: `https://ncaa-api.henrygd.me/`
- **Coverage**: Multiple seasons (exact range not documented)
- **Cost**: Free (5 req/sec rate limit on public instance)
- **Data Available**:
  - Live scores
  - Team/player stats
  - Standings
  - Play-by-play data
  - Rankings (AP Top 25)
- **Endpoints**:
  - Scores: `/scoreboard/basketball-men/d1/2024/02/01`
  - Game PBP: `/game/{game_id}/play-by-play`
  - Stats: `/stats/basketball-men/d1/2024?stat=fg-pct&page=1&size=20`
- **Advantages**:
  - Simple REST API
  - Well-documented
  - Can self-host for unlimited access
- **Use Case**: Alternative to ESPN API with simpler endpoints

### 3. hoopR (R Package → Python via rpy2)
- **Website**: https://hoopr.sportsdataverse.org/
- **Coverage**: 2002-present
- **Cost**: Free, open source
- **Data Sources**: Aggregates ESPN, KenPom, Bart Torvik, EvanMiya
- **Advantages**:
  - Comprehensive data aggregation
  - Includes advanced metrics
  - Part of sportsdataverse ecosystem
- **Limitation**: R package (would need rpy2 bridge for Python)
- **Use Case**: If you need advanced analytics alongside play-by-play

---

## Commercial Data Sources (Paid)

### 1. SportsDataIO
- **Website**: https://sportsdata.io/ncaa-college-basketball-api
- **Coverage**: "Decades of historical data"
- **Cost**: Starting at $50/month (varies by plan)
- **Data Available**:
  - Real-time scores
  - Play-by-play
  - Player/team stats
  - Odds and projections
  - News and images
- **Advantages**:
  - Very comprehensive
  - High reliability and uptime
  - Excellent documentation
  - Commercial support
- **Use Case**: If you need enterprise-grade reliability and support

### 2. Sportradar NCAA Men's Basketball API
- **Website**: https://developer.sportradar.com/basketball/docs/ncaamb-ig-api-basics
- **Coverage**: 2013-present (~12 years)
- **Cost**: Custom pricing (enterprise level)
- **Data Available**:
  - Game summaries
  - Play-by-play
  - Season/tournament schedules
  - Team rosters and rankings
  - Real-time feeds
- **Advantages**:
  - Official NCAA data partner
  - Extremely reliable
  - Real-time streaming
- **Limitation**: Only goes back to 2013, expensive
- **Use Case**: If you're building a commercial product

### 3. API-Basketball
- **Website**: https://www.api-basketball.com/
- **Coverage**: Multiple years
- **Cost**: Free tier + paid plans
- **Data Available**:
  - Games and livescores
  - Teams and standings
  - Statistics
  - Historical data
- **Use Case**: Multi-sport applications needing basketball data

---

## Web Scraping Options (Use with Caution)

### Sports-Reference.com (College Basketball)
- **URL**: https://www.sports-reference.com/cbb/
- **Coverage**: 1948-present (70+ years!)
- **Cost**: Free to scrape (be respectful of rate limits)
- **Data Available**:
  - Team records by season
  - Player statistics
  - Game results
  - Tournament data
- **Advantages**:
  - Most comprehensive historical coverage
  - Includes very old data back to 1948
- **Limitations**:
  - No official API
  - Must scrape HTML (may break if site changes)
  - No play-by-play data in most cases
  - Must respect robots.txt and rate limits
- **Tools**: Can use BeautifulSoup, Scrapy, or playwright
- **Use Case**: Historical season statistics before 2002

---

## Recommended Implementation Strategy

### Phase 1: Optimize Current ESPN API (Immediate)
✅ Continue using ESPN API as primary source
✅ Optimize date range to basketball season only (Oct-April)
✅ Add support for fetching 10+ year date ranges
✅ Implement better error handling and retry logic

### Phase 2: Add CBBpy as Backup (Optional)
- Install CBBpy package
- Use as fallback when ESPN API fails
- Can also validate data accuracy by comparing sources

### Phase 3: Consider NCAA API Integration (Future)
- Test NCAA API endpoints
- Compare data quality with ESPN
- Potentially use for real-time updates (simpler endpoints)

### Phase 4: Commercial API (If Needed)
- Only consider SportsDataIO or Sportradar if:
  - Building a commercial product
  - Need guaranteed uptime SLAs
  - Require customer support
  - Need data before 2002

---

## Data Source Comparison Matrix

| Source | Coverage | Cost | PBP Data | Ease of Use | Reliability | Best For |
|--------|----------|------|----------|-------------|-------------|----------|
| **ESPN API** | 2002-now | Free | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Primary source |
| **CBBpy** | 2002-now | Free | ✅ Yes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Backup/supplement |
| **NCAA API** | ~2010-now | Free | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Alternative |
| **hoopR** | 2002-now | Free | ✅ Yes | ⭐⭐⭐ | ⭐⭐⭐⭐ | Advanced analytics |
| **SportsDataIO** | Decades | $$$$ | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Commercial apps |
| **Sportradar** | 2013-now | $$$$$ | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |
| **Sports-Ref** | 1948-now | Free | ❌ No | ⭐⭐ | ⭐⭐⭐ | Pre-2002 data |

---

## Next Steps

1. ✅ **Optimize fetch_historical_data.py for basketball season dates** (Oct-April)
2. ✅ **Add 10-year fetch option**
3. ⏳ Test ESPN API reliability for old data (2010-2015)
4. ⏳ Consider installing CBBpy as backup data source
5. ⏳ Document any data gaps or quality issues

---

## Important Notes

- **ESPN API** has no official documentation but has been stable for years
- Always implement **rate limiting** (0.5-1s delays) to be respectful
- Store **game_id** and **team_id** to enable cross-referencing between sources
- Consider implementing **data validation** by comparing multiple sources
- Be aware of **NCAA rules changes** over the years that affect statistics

---

## Contact & Resources

- ESPN API (unofficial): No documentation, reverse-engineered
- CBBpy GitHub: https://github.com/saiemgilani/cbbpy
- NCAA API GitHub: https://github.com/henrygd/ncaa-api
- SportsDataIO Support: https://sportsdata.io/contact
- Sportradar Support: https://developer.sportradar.com/support
