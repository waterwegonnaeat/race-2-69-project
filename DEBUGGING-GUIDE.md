# Team Search Debugging Guide

## Current Status

✅ **Deployed with logging**: Production site now has comprehensive logging
✅ **Test tools ready**: HTML test page created
✅ **Port 6543 configured**: Transaction mode pooling enabled locally

## Next Steps to Debug

### 1. Open the Test Page

Open this file in your browser:
```
file:///c:/vscode_workspaces/webapp_workspaces/race-2-69-project/test-team-search.html
```

Or just double-click: `test-team-search.html`

This will let you:
- ✅ Test localhost API (to confirm it still works)
- ✅ Test production API (to see the actual error)
- ✅ Test debug endpoint (for detailed diagnostics)

### 2. Check Vercel Environment Variable

Make sure port 6543 is in Vercel:

```bash
vercel env pull
cat .env.vercel.production
```

Should show:
```
DATABASE_URL="postgresql://postgres.crztslnktsernddpakok:_Eyj4f-GKK47QJzorf*R@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
```

If it still shows port **5432**, update it:
```bash
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste: postgresql://postgres.crztslnktsernddpakok:_Eyj4f-GKK47QJzorf*R@aws-1-us-east-2.pooler.supabase.com:6543/postgres
vercel --prod
```

### 3. Visit Production Site

Go to: https://race-2-69-project.vercel.app

1. Click "Team Analysis" tab
2. Type "raz" in the search box
3. Open browser DevTools (F12) → Console tab
4. Look for errors

### 4. Check Vercel Logs

After trying to search on the website:

```bash
vercel logs race-2-69-project.vercel.app
```

Look for lines with `[TEAM_SEARCH]` prefix. They will show:
- Query received
- Database query time
- Number of games found
- Number of teams returned
- Any errors

## Common Issues & Solutions

### Issue 1: "No teams found" but logs show teams returned
**Problem**: Frontend not displaying results
**Solution**: Check TeamSearch component state management

### Issue 2: Request takes >10 seconds then fails
**Problem**: Cold start + slow database connection
**Solution**: Port 6543 pooling (already applied)

### Issue 3: Database connection error
**Problem**: Wrong DATABASE_URL in Vercel
**Solution**: Update environment variable (see step 2 above)

### Issue 4: Prisma Client not generated
**Problem**: Build failed
**Check**: Visit https://vercel.com/waterwegonnaeats-projects/race-2-69-project/deployments
**Look for**: "✓ Generated Prisma Client" in build logs

## What We Changed

### 1. Fixed PBP API Path ✅
```typescript
// Before: /api/games/${id}/play-by-play
// After:  /api/games/${id}/pbp
```

### 2. Added Logging to Team Search ✅
```typescript
console.log('[TEAM_SEARCH] Query:', query)
console.log('[TEAM_SEARCH] DB query completed in', ms)
console.log('[TEAM_SEARCH] Returning', teams.length, 'teams')
```

### 3. Updated Database URL (Local) ✅
```
Port 5432 → Port 6543 (Transaction Mode Pooling)
```

### 4. Added maxDuration ✅
```typescript
export const maxDuration = 30 // 30 seconds for cold starts
```

### 5. Created Test Endpoints ✅
- `/api/test-team-search` - Debug endpoint with detailed info
- `test-team-search.html` - Visual testing tool

## Files Modified

1. ✅ [app/api/teams/search/route.ts](app/api/teams/search/route.ts) - Added logging
2. ✅ [app/api/test-team-search/route.ts](app/api/test-team-search/route.ts) - New debug endpoint
3. ✅ [lib/prisma.ts](lib/prisma.ts) - Enabled production logging
4. ✅ [app/game/[id]/page.tsx](app/game/[id]/page.tsx) - Fixed PBP path
5. ✅ [test-team-search.html](test-team-search.html) - New test tool

## Vercel Dashboard Links

- **Deployments**: https://vercel.com/waterwegonnaeats-projects/race-2-69-project/deployments
- **Logs**: https://vercel.com/waterwegonnaeats-projects/race-2-69-project/logs
- **Settings**: https://vercel.com/waterwegonnaeats-projects/race-2-69-project/settings

## Test URLs

- **Production Site**: https://race-2-69-project.vercel.app
- **Team Search API**: https://race-2-69-project.vercel.app/api/teams/search?q=raz
- **Debug Endpoint**: https://race-2-69-project.vercel.app/api/test-team-search?q=raz

## What to Report

When you find the issue, report:
1. What error message appears (if any)
2. What the console shows
3. What the Vercel logs show
4. Response from debug endpoint
5. Does it work on localhost but not production?

---

**Status**: Waiting for user to test with new logging
**Last Deploy**: [Check commit 55d3462]
**Next**: Open test-team-search.html and run all 3 tests
