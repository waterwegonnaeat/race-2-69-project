# Play-by-Play Data Fix

## Problem
Play-by-play (PBP) data wasn't visible on the game detail pages when deployed to Vercel.

## Root Cause
**API endpoint path mismatch**: The game detail page ([app/game/[id]/page.tsx](app/game/[id]/page.tsx)) was fetching from `/api/games/${id}/play-by-play`, but the actual API endpoint is at `/api/games/[gameId]/pbp`.

## Data Status ✅
Your data IS in Supabase and working correctly:
- **4,332 Games** ✅
- **1,239,255 PBP Events** ✅
- **5,082 R69 Events** ✅

## Fix Applied
Changed the fetch URL in [app/game/[id]/page.tsx:38](app/game/[id]/page.tsx#L38):

```typescript
// BEFORE (incorrect)
const pbpRes = await fetch(`/api/games/${id}/play-by-play`)

// AFTER (correct)
const pbpRes = await fetch(`/api/games/${id}/pbp`)
```

## Why This Happened on Vercel
When you deploy to Vercel:
1. Vercel builds your Next.js app and creates API routes
2. The API route structure must match exactly
3. Next.js file-based routing maps `/app/api/games/[gameId]/pbp/route.ts` → `/api/games/:gameId/pbp`
4. The incorrect path `/play-by-play` returned 404, so no PBP data was shown

## Testing the Fix
After deploying to Vercel:
1. Navigate to any game detail page (e.g., `/game/401705882`)
2. You should now see:
   - ✅ Scoring progression chart
   - ✅ Play-by-play timeline (first 50 events)
   - ✅ Correct pace/possession stats

## API Endpoints Reference
Correct endpoints for your app:
- `/api/games` - List games with filtering
- `/api/games/[id]` - Game details
- `/api/games/[id]/pbp` - ⭐ Play-by-play events
- `/api/games/[id]/r69` - R69 event details
- `/api/games/[id]/stream` - SSE stream for live games
- `/api/teams/search` - Team autocomplete
- `/api/teams/[teamName]/games` - Team-specific games

## Note About Missing PBP Data
According to [PROGRESS.md](PROGRESS.md), 673 games (15.5%) are missing PBP data due to ESPN API limitations. This is normal - the app will gracefully handle these cases by showing "No play-by-play data available for this game."

---

**Status**: ✅ Fixed on 2025-11-12
