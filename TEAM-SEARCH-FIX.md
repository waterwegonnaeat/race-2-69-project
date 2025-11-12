# Team Search Issue on Vercel - Troubleshooting Guide

## Problem
Team search works perfectly on `localhost:3000` but doesn't return results on Vercel production (`race-2-69-project.vercel.app`).

**Example**: Searching for "raz" should return "Arkansas Razorbacks" but nothing appears on Vercel.

## Root Cause Analysis

### Confirmed Working ✅
1. **Data exists in Supabase**: 4,332 games, 1.2M+ PBP events
2. **Environment variables set**: `DATABASE_URL`, `ESPN_API_BASE`, `LEAGUE` all configured
3. **Prisma postinstall**: `"postinstall": "prisma generate"` is in package.json
4. **API endpoint exists**: `/api/teams/search` route is deployed
5. **Local works perfectly**: Returns "Arkansas Razorbacks" immediately

### Potential Issues on Vercel

#### 1. **Serverless Cold Starts** (Most Likely)
Vercel uses serverless functions that "sleep" when not in use. First request after sleep:
- Takes 5-10 seconds to initialize Prisma Client
- May timeout before returning results
- Database connection pooling issues

**Solution**: Upgrade to Supabase Transaction Mode Pooling (Port 6543)

#### 2. **Database Connection Timeout**
Default Prisma connection may timeout on Vercel's serverless environment.

**Solution**: Add connection pooling configuration to Prisma schema

#### 3. **Prisma Client Not Generated**
If build fails to run `prisma generate`, queries will fail silently.

**Solution**: Verify build logs show "Generated Prisma Client"

## Fix Steps

### Step 1: Test the Debug Endpoint
Visit: `https://race-2-69-project.vercel.app/api/test-team-search?q=raz`

This endpoint provides detailed debugging information:
- Can it connect to database?
- How many games found?
- What teams were returned?
- Any error messages?

### Step 2: Upgrade to Transaction Mode Pooling (Recommended)

1. Update your `DATABASE_URL` in Vercel to use port **6543** instead of **5432**:

```bash
# Old (Session Mode)
DATABASE_URL=postgresql://postgres:password@db.jvrxzmiarcqgpobnmnyj.supabase.co:5432/postgres

# New (Transaction Mode - Better for Serverless)
DATABASE_URL=postgresql://postgres:password@db.jvrxzmiarcqgpobnmnyj.supabase.co:6543/postgres
```

2. Update in Vercel:
```bash
vercel env rm DATABASE_URL
vercel env add DATABASE_URL
# Paste the new URL with port 6543 for all environments
```

3. Redeploy:
```bash
vercel --prod
```

### Step 3: Add Connection Pooling Configuration

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

Add to `.env.local` and Vercel:
```bash
DIRECT_URL=postgresql://postgres:password@db.jvrxzmiarcqgpobnmnyj.supabase.co:5432/postgres
```

### Step 4: Check Build Logs

```bash
vercel logs https://race-2-69-project.vercel.app --output=build
```

Look for:
- `✓ Generated Prisma Client`
- Any database connection errors
- Timeout warnings

## Testing After Deploy

### 1. Test Debug Endpoint
```bash
# Visit in browser (not curl - Vercel blocks automation)
https://race-2-69-project.vercel.app/api/test-team-search?q=raz
```

Expected response:
```json
{
  "success": true,
  "query": "raz",
  "totalGames": 4332,
  "teamsFound": 1,
  "teams": [
    {"teamId": "8", "teamName": "Arkansas Razorbacks"}
  ]
}
```

### 2. Test Team Search on Main Page
1. Go to https://race-2-69-project.vercel.app
2. Click "Team Analysis" tab
3. Type "raz" in search box
4. Should see "Arkansas Razorbacks" in dropdown

### 3. Check Browser Console
Open DevTools (F12) → Console tab:
- Look for API errors
- Check network requests to `/api/teams/search`
- Verify response contains teams array

## Common Error Messages

### Error: "Can't reach database server"
**Fix**: Database URL is incorrect or Supabase is down
```bash
# Verify connection string
vercel env pull
cat .env.vercel
```

### Error: "Connection pool timeout"
**Fix**: Switch to port 6543 (transaction mode pooling)

### Error: "PrismaClient is unable to run in this browser environment"
**Fix**: Make sure API route has `export const dynamic = 'force-dynamic'`

### No error, but empty results
**Fix**: Cold start issue - wait 10 seconds and try again

## Files Changed

1. ✅ [app/game/[id]/page.tsx](app/game/[id]/page.tsx) - Fixed PBP endpoint path
2. ✅ [app/api/test-team-search/route.ts](app/api/test-team-search/route.ts) - New debug endpoint
3. ✅ [PROGRESS.md](PROGRESS.md) - Updated API endpoint documentation
4. ✅ [PBP-FIX.md](PBP-FIX.md) - Play-by-play fix documentation

## Next Steps

1. **Immediate**: Visit test endpoint in browser to see actual error
2. **Quick Fix**: Switch to port 6543 for better serverless performance
3. **Long Term**: Consider connection pooling service like PgBouncer
4. **Monitoring**: Add logging to team search endpoint to track issues

## Support Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Status**: Deployed with debug endpoint
**Last Updated**: 2025-11-12
**Test URL**: https://race-2-69-project.vercel.app/api/test-team-search?q=raz
