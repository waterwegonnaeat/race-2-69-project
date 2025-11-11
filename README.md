# 🏀 R69W: Race-to-69 & Win Dashboard

## The NCAA Basketball Analytics Platform Tracking the Most Interesting Stat in Sports

> **Status**: ✅ **LIVE IN PRODUCTION** - Deployed to Vercel
>
> **Live URL**: https://race-2-69-project.vercel.app

---

## 📖 What is R69W?

**R69W** (Race-to-69 & Win) is a data-driven web application that tracks a fascinating phenomenon in NCAA basketball: **when a team is the first to reach 69 points, there is a strong positive correlation with winning the game.**

This project combines real-time sports data from ESPN, statistical analysis, and engaging visualizations to explore tempo, momentum, and predictive patterns in college basketball.

### 🎯 The Phenomenon

Statistical analysis shows that teams who reach 69 points first demonstrate a strong correlation with game victory across thousands of NCAA basketball games. This dashboard tracks, analyzes, and celebrates this remarkable pattern, providing insights into game tempo and momentum.

---

## 🚀 Live Deployment

The app is currently deployed and running on Vercel:

- **Production URL**: https://race-2-69-project.vercel.app
- **Dashboard**: https://vercel.com/waterwegonnaeats-projects/race-2-69-project
- **Status**: ✅ Build successful, fully deployed
- **Hosting Cost**: $0/month (Vercel free tier)

### Recent Deployment Fixes (Nov 11, 2025)

Successfully resolved all deployment issues:
- ✅ Fixed dynamic server usage errors (15 API routes)
- ✅ Fixed useSearchParams Suspense boundary
- ✅ Updated Next.js configuration for dynamic rendering
- ✅ All TypeScript compilation errors resolved
- ✅ Build completes successfully in ~1 minute

**See [DEPLOYMENT_SUCCESS.txt](./DEPLOYMENT_SUCCESS.txt) for detailed fix documentation.**

---

## 🎯 Core Features

### 1. **📊 Today's Board** (Main Dashboard)
Modern, responsive dashboard showing:
- Live game tracking with real-time updates
- Smart team search with autocomplete and team logos
- Season selector with multi-season support
- R69 progress bars for each team
- Game filtering by date, league, and status
- Quick stats: Total Games, Live Games, R69 Events, R69W Rate
- Click-to-filter navigation on team names/logos
- Comprehensive game data loaded from ESPN API

### 2. **🎮 Game Tracker** (Detail Page)
Interactive game analysis featuring:
- Dual-line scoring "worm chart" (Recharts)
- Team logos in game headers (clickable for team analysis)
- R69 event detection and visual markers
- Play-by-play timeline with detailed events
- Quick stats: Total Points, Pace, Lead Changes, Periods
- R69 milestone highlighting and tooltips

### 3. **🏆 Leaderboards**
Comprehensive rankings across three categories:
- **Teams**: Top R69W performers with team logos and medal icons
- **Conferences**: Conference-level success rates
- **Speed**: Fastest teams to reach 69 points with logos
- Detailed metrics per team/conference
- Click-to-filter for detailed team analysis

### 4. **📈 Statistics Explorer**
Deep dive analytics with interactive charts:
- Win rates by conference (Bar chart)
- Margin distribution (Stacked bars)
- Timing analysis (Line chart)
- Weekly trends (Multi-line)
- Outcome distribution (Pie chart)
- **NEW**: Consecutive 100% seasons tracker (Tennessee: 5!)
- Key insights and statistical findings

### 5. **⭐ The 69 Club**
Elite teams showcase featuring:
- Three-tier system (Platinum, Gold, Silver)
- Team logos for easy identification
- Achievement badges and streaks
- Team cards with comprehensive stats
- Membership requirements (70%+ win rate tiers, minimum events)
- Click-to-filter for team exploration

### 6. **🎉 Nice Games**
Celebrating perfect 69-point moments:
- Games where teams finish with exactly 69 points
- Teams that reached 69 first (regardless of lead)
- Fun, party-themed design with team logos
- R69 event details and win rates
- "Nice!" celebration badges

### 7. **😬 Hall of Shame (Premature-69)**
Cautionary tales of first to 69 but still losing:
- Full site navigation with "Back to Main" button
- Dark theme matching main site design
- Glassmorphism cards with backdrop blur
- Teams that reached 69 first but lost
- Team and opponent logos for context (clickable)
- Shame level indicators (Critical, High, Moderate)
- Point differential and blown lead statistics
- Mobile-responsive with hamburger menu
- Click-to-filter for deeper team analysis

---

## 📚 Documentation

Comprehensive documentation organized by topic:

### Getting Started
- **[SETUP.md](./SETUP.md)** - Complete setup instructions for development environment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[DEPLOYMENT_SUCCESS.txt](./DEPLOYMENT_SUCCESS.txt)** - Recent deployment fixes and solutions
- **[PROGRESS.md](./PROGRESS.md)** - Development changelog and current status

### Technical Documentation
- **[R69W_ARCHITECTURE.md](./R69W_ARCHITECTURE.md)** - System architecture, database schema, and technical design
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - API endpoints, request/response examples, and integration guide
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Feature tracking and implementation status

### Feature Guides
- **[TEAM_LOGO_IMPLEMENTATION.md](./TEAM_LOGO_IMPLEMENTATION.md)** - Team logo system and click-to-filter functionality
- **[DATABASE_CLEANUP.md](./DATABASE_CLEANUP.md)** - Data quality procedures, cleanup scripts, and validation

### Setup Guides
- **[setup-supabase.md](./setup-supabase.md)** - Supabase-specific configuration
- **[setup-postgres.md](./setup-postgres.md)** - PostgreSQL setup for local development
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Vercel deployment configuration
- **[HOSTING_OPTIONS.md](./HOSTING_OPTIONS.md)** - Alternative hosting platforms

### Key Files
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Complete database schema with tables, relations, and indexes
- **[scripts/fetch_historical_data.py](./scripts/fetch_historical_data.py)** - ESPN API integration supporting 1 year of historical data
- **[scripts/fetch_team_logos.py](./scripts/fetch_team_logos.py)** - Team logo fetcher from ESPN CDN (95% coverage)
- **[scripts/analyze-r69-stats.js](./scripts/analyze-r69-stats.js)** - Statistical analysis and validation
- **[components/ScoringWormChart.tsx](./components/ScoringWormChart.tsx)** - Interactive scoring visualization with R69 highlighting
- **[components/TeamLogo.tsx](./components/TeamLogo.tsx)** - Reusable team logo component with fallbacks

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase or Neon recommended)
- Python 3.9+ (for data ingestion)
- Git

### Installation

```bash
# 1. Clone/navigate to project
cd race-2-69-project

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Create .env with your DATABASE_URL
# Example: DATABASE_URL=postgresql://user:password@host:5432/db

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
# Access at http://localhost:3000 (or 3001 if configured)
```

### Fetch Historical Data

```bash
# Navigate to scripts
cd scripts

# Install Python dependencies
pip install requests psycopg2-binary python-dotenv

# Setup scripts/.env with your DATABASE_URL

# Run data fetcher
python fetch_historical_data.py

# Options:
#   1. Last 7 days
#   2. Last 30 days (1 month)
#   3. Last 90 days (3 months)
#   4. Last 365 days (1 YEAR) ⭐ Recommended
#   5. Custom number of days
```

### Fetch Team Logos

```bash
cd scripts
python fetch_team_logos.py
# Fetches logos for all teams in database
# ~95% success rate
# Rate limited to prevent API issues
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.33 (React 18, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **State**: React Query (@tanstack/react-query)
- **Images**: Next.js Image component for optimized team logos
- **Animations**: Framer Motion for smooth transitions

### Backend
- **API**: Next.js API Routes (server-side with dynamic rendering)
- **Database**: PostgreSQL with Prisma ORM
- **Data Pipeline**: Python scripts for ESPN API integration

### Data Sources
- **Primary**: ESPN API (unofficial, comprehensive game data)
- **Team Logos**: ESPN CDN (95% coverage, 555+ teams)
- **Update Frequency**: Manual fetch or scheduled updates
- **Data Scope**: Multiple seasons, thousands of games

### Infrastructure
- **Hosting**: Vercel (free tier, 100GB bandwidth/month)
- **Database**: Neon.tech or Supabase (free tier)
- **Build Time**: ~1 minute
- **Deployment**: Automatic via GitHub integration

### Technical Highlights
- **Dynamic Rendering**: All API routes configured with `export const dynamic = 'force-dynamic'`
- **Suspense Boundaries**: Proper handling of client-side routing with useSearchParams
- **Standalone Output**: Optimized for serverless deployment
- **Type Safety**: Full TypeScript coverage with strict mode

---

## 📊 Key Metrics & Statistics

### R69W Correlation
The app tracks the correlation between being first to 69 and winning:
- **Current Analysis**: Strong positive correlation between reaching 69 first and winning
- **Data Set**: Thousands of games across multiple seasons analyzed
- **Validated**: Multiple statistical validation scripts confirm data quality
- **By Conference**: Varies across different conferences
- **Margin Impact**: Win rate increases with larger leads at 69

### Performance Metrics
- Average Time to 69: Mid-to-late second half (varies by tempo)
- Most Common Period: **Period 2** (second half)
- Team Coverage: **579+ unique teams** with 95% logo coverage
- Data Quality: ~95% completeness for core fields

### Deployment Stats
- Build Time: ~60 seconds
- Bundle Size: 87.5 KB (shared first load JS)
- API Routes: 17 (all dynamic)
- Pages: 6 (optimized for dynamic rendering)
- Total Routes: 23

---

## 🎯 Development Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Database schema with Prisma
- [x] Data ingestion pipeline (Python + ESPN API)
- [x] Game tracker with scoring charts
- [x] Today's board dashboard
- [x] Team statistics and analysis

### Phase 2: Analytics ✅ COMPLETE
- [x] Leaderboards (Teams, Conferences, Speed)
- [x] Statistics explorer with charts
- [x] Historical data (1 year+)
- [x] R69 event tracking and analysis
- [x] Consecutive 100% seasons tracker

### Phase 3: Enhanced Features ✅ COMPLETE
- [x] Team logo system (95% coverage)
- [x] Click-to-filter navigation
- [x] The 69 Club (elite teams)
- [x] Nice Games (perfect 69s)
- [x] Hall of Shame (premature-69)
- [x] Mobile responsive design
- [x] Multi-season support

### Phase 4: Production Deployment ✅ COMPLETE
- [x] Vercel deployment configuration
- [x] Dynamic rendering fixes
- [x] Suspense boundary implementation
- [x] Build optimization
- [x] Production URL live

### Phase 5: Future Enhancements (Optional)
- [ ] Real-time live game updates
- [ ] Predictive analytics with ML
- [ ] User accounts and favorites
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Public API for developers

---

## 🚀 Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

### Quick Deploy

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for deployment"

# 2. Deploy to Vercel
vercel --prod

# 3. Add DATABASE_URL in Vercel dashboard
# https://vercel.com/[your-project]/settings/environment-variables
```

### Post-Deployment
1. Add `DATABASE_URL` environment variable in Vercel
2. Get free database from Neon.tech or Supabase
3. Vercel automatically redeploys with new env vars
4. Your app is live!

**Total Cost**: $0/month

---

## 🤝 Contributing

Contributions welcome! Areas where help is needed:

1. **Data Collection**
   - Improving ESPN API reliability
   - Adding alternative data sources
   - Historical data backfill

2. **Analytics**
   - New metric calculations
   - Statistical models
   - Machine learning predictions

3. **UI/UX**
   - Component improvements
   - Mobile optimization
   - Accessibility enhancements

4. **Documentation**
   - Tutorial videos
   - Blog posts
   - Integration guides

---

## 📝 License

MIT License - feel free to use this code for your own projects!

---

## 🙏 Acknowledgments

- **ESPN** for (unofficially) providing game data
- **NCAA** for statistical records
- **Basketball analytics community** for inspiration
- **Open source community** for excellent tools and libraries
- **Vercel** for free hosting and excellent developer experience

---

## 📞 Contact & Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Live App**: https://race-2-69-project.vercel.app

---

## 🌟 Why This Project?

R69W exists because:

1. **It's fun**: The number 69 adds levity to sports analytics
2. **It's interesting**: The correlation is statistically significant
3. **It's educational**: Teaches web development, data engineering, and statistics
4. **It's open**: All code and data are accessible
5. **It's useful**: Provides real insights into game tempo and momentum
6. **It's free**: $0/month to run in production

---

## 📋 Project Structure

```
race-2-69-project/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Main dashboard (with Suspense)
│   ├── game/[id]/page.tsx       # Game detail
│   ├── leaderboards/page.tsx    # Leaderboards
│   ├── stats/                   # Statistics pages
│   │   ├── page.tsx            # Stats explorer
│   │   ├── 69-club/            # Elite teams
│   │   ├── nice-games/         # Perfect 69s
│   │   └── premature-69/       # Hall of shame
│   └── api/                     # API routes (all dynamic)
├── components/                   # React components
│   ├── TeamLogo.tsx            # Logo component
│   ├── TeamGamesTimeline.tsx   # Team analysis
│   ├── ScoringWormChart.tsx    # Game charts
│   └── ui/                     # shadcn/ui components
├── scripts/                      # Data pipeline
│   ├── fetch_historical_data.py  # Main data fetcher
│   ├── fetch_team_logos.py      # Logo fetcher
│   ├── analyze-r69-stats.js     # Statistics analyzer
│   └── validation-procedures.js # Data validation
├── prisma/
│   └── schema.prisma           # Database schema
├── next.config.js               # Next.js config (standalone mode)
├── DEPLOYMENT_SUCCESS.txt       # Deployment fixes documentation
└── Documentation...             # See above
```

---

**Ready to explore the data? Start with SETUP.md and then dive into the dashboard!**

🏀 Let's track some R69Ws! 🏀

---

**Built with ❤️ by the basketball analytics community**

*Race to 69. Win the game. Track the stats.*

---

*Last Updated: November 11, 2025*
*Deployed: ✅ Live on Vercel*
