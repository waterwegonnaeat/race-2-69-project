# Quick Reference - R69W Project

## 🚀 Common Commands

### Development
```bash
npm run dev          # Start dev server (localhost:3001)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
node test-local-db.js # Test database connection
```

### Data Fetching
```bash
cd scripts
python fetch_historical_data.py  # Fetch game data
python fetch_team_logos.py       # Fetch team logos
python fetch_missing_pbp.py      # Fetch missing PBP data
node list-missing-pbp.js         # List games without PBP
```

### Vercel Deployment
```bash
vercel                # Deploy to preview
vercel --prod         # Deploy to production
vercel logs           # View deployment logs
vercel env ls         # List environment variables
```

## 📊 Database Status

- **Games:** 4,332
- **R69 Events:** 5,082 (72.9% coverage)
- **PBP Events:** 1,239,255
- **Missing PBP:** 673 games

## 🔗 Important Links

- **Production:** https://race-2-69-project.vercel.app
- **Vercel Dashboard:** https://vercel.com/waterwegonnaeats-projects/race-2-69-project
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jvrxzmiarcqgpobnmnyj

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Database connection fails
```bash
node test-local-db.js  # Test connection
# Check .env.local has DATABASE_URL
```

### Vercel deployment fails
```bash
vercel logs            # Check error logs
vercel env ls          # Verify DATABASE_URL is set
```

### Missing data on site
- 27% of games don't have R69 events (normal - low-scoring games)
- Run `node check-all-data.js` for detailed breakdown

## 📁 Key Files

| File | Purpose |
|------|---------|
| `db.js` | Database connection for Node scripts |
| `lib/prisma.ts` | Database connection for Next.js |
| `prisma/schema.prisma` | Database schema |
| `.env.local` | Local environment variables |
| `next.config.js` | Next.js configuration |
| `package.json` | Dependencies and scripts |

## 🎯 Data Quality

### Expected Missing R69 Events
- **2,792 games** - Neither team reached 69 (normal)
- **673 games** - No PBP data (can be fetched)
- **0 games** - Detection failures (100% accuracy!)

### How to Improve Coverage
1. Run `python fetch_missing_pbp.py`
2. Start with 10-50 games to test
3. Process all 673 games (~7 minutes)

## ⚡ Performance Tips

### For Low Traffic (Current Setup)
- Direct connection (port 5432) ✅
- Works great for dev and small production

### For High Traffic
- Switch to Transaction Mode (port 6543)
- Enable connection pooling
- Better for serverless architecture

## 📝 Notes

- Vercel automatically redeploys on git push
- DATABASE_URL already configured in Vercel ✅
- `postinstall` script ensures Prisma Client builds ✅
- All scripts have rate limiting for ESPN API
