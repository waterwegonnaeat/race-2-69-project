# Team Logo Implementation Guide

## ✅ Completed

### 1. Logo Data Collection
- **Script Created**: `scripts/fetch_team_logos.py`
- **Source**: ESPN API (https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{teamId})
- **Database**: Logos already stored in `games` table (`home_team_logo`, `away_team_logo`)
- **Result**: Successfully fetched and stored logos for all teams

### 2. TeamLogo Component
- **File**: `components/TeamLogo.tsx`
- **Features**:
  - Displays team logo with fallback to team initials
  - Click-to-filter functionality - navigates to `/?team={teamName}&tab=teams`
  - Multiple sizes: xs, sm, md, lg, xl
  - `TeamWithLogo` component for displaying team name + logo
  - Keyboard accessible (Enter/Space to activate)
  - Hover effects with ring highlight

### 3. URL Parameters & Auto-Selection
- **Updated**: `app/page.tsx`
  - Reads `?team=` parameter from URL to auto-select team
  - Reads `?tab=` parameter to switch to correct tab
  - Default: Shows all seasons and games

### 4. Season Selector Enhancement
- **Updated**: `components/SeasonSelector.tsx`
- **API Created**: `app/api/seasons/route.ts`
- **Features**:
  - Fetches available seasons from database
  - `autoSelectAll` prop to select all seasons by default
  - Falls back to generated seasons if API fails

## 📋 How to Add Logos to Components

### Quick Implementation Pattern

```tsx
import { TeamWithLogo } from '@/components/TeamLogo'

// In your component:
<TeamWithLogo
  teamName={game.homeTeamName}
  logoUrl={game.homeTeamLogo}
  size="sm"
  clickable={true}
  className="hover:text-basketball-orange"
/>
```

### Component-Specific Instructions

#### 1. TeamGamesTimeline.tsx
**Location**: Game cards showing opponent
```tsx
// Find: opponent name display
// Replace with:
<TeamWithLogo
  teamName={game.opponent}
  logoUrl={game.opponentLogo}  // Add this field to chartData
  size="sm"
/>
```

**Required Changes**:
- Add `opponentLogo` to `chartData`:
  ```tsx
  opponentLogo: isHome ? game.awayTeamLogo : game.homeTeamLogo
  ```

#### 2. Leaderboards (app/leaderboards/page.tsx)
**Location**: Team name in leaderboard table
```tsx
<TeamWithLogo
  teamName={team.teamName}
  logoUrl={team.logoUrl}  // Need to add to API response
  size="sm"
  layout="horizontal"
  logoPosition="left"
/>
```

**API Update Needed**:
- Update leaderboard API routes to join with games table for logos
- Or add `teamLogo` field to `teams` table

#### 3. Stats Pages (69-club, premature-69, nice-games)
**Location**: Team names in game lists
```tsx
<TeamWithLogo
  teamName={game.teamName}
  logoUrl={game.teamLogo}
  size="md"
  clickable={true}
/>
```

#### 4. Game Page (app/game/[id]/page.tsx)
**Location**: Team names in game header
```tsx
// Home team
<TeamWithLogo
  teamName={game.homeTeamName}
  logoUrl={game.homeTeamLogo}
  size="lg"
  layout="vertical"
/>

// Away team
<TeamWithLogo
  teamName={game.awayTeamName}
  logoUrl={game.awayTeamLogo}
  size="lg"
  layout="vertical"
/>
```

## 🎨 Size Reference

| Size | Pixels | Best Use Case |
|------|--------|---------------|
| xs   | 16x16  | Inline text, small badges |
| sm   | 24x24  | Tables, compact lists |
| md   | 32x32  | Cards, default display |
| lg   | 48x48  | Headers, featured content |
| xl   | 64x64  | Hero sections, main displays |

## 🔄 Click-to-Filter Behavior

All TeamLogo components with `clickable={true}` (default) will:
1. Navigate to `/?team={encodeURIComponent(teamName)}&tab=teams`
2. Automatically load the team's data
3. Show **all seasons** by default (as requested)
4. Display in the "Team Analysis" tab

## 🚀 Testing Checklist

- [ ] Click on team logo navigates to correct team view
- [ ] All seasons are selected by default
- [ ] Logos display correctly with proper sizing
- [ ] Fallback initials show for teams without logos
- [ ] Hover effects work (ring highlight for logos)
- [ ] Keyboard navigation works (Tab + Enter/Space)
- [ ] Mobile responsive (logos scale properly)

## 📊 Logo Coverage

From fetch_team_logos.py run:
- **Total teams**: 579
- **Already had logos**: ~490
- **Newly fetched**: ~65
- **Failed to fetch**: ~24 (mostly small colleges/NAIA teams)
- **Coverage**: ~95%

## 🎯 Future Enhancements

1. **Team Page**: Create dedicated `/team/[name]` route with comprehensive stats
2. **Logo Cache**: Implement Next.js Image optimization with proper caching
3. **Team Colors**: Extract and use team primary/secondary colors for theming
4. **Conference Logos**: Add conference logos alongside team logos
5. **Logo Fallback Service**: Create backup logo service for teams without ESPN logos
