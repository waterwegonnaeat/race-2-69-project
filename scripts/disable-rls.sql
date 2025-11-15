-- ============================================
-- DISABLE RLS ON PUBLIC TABLES
-- ============================================
-- Context: This application uses Prisma with direct PostgreSQL connection (port 5432)
-- and has no user authentication system. All data is public statistics.
-- RLS is not needed and was likely enabled by mistake.
--
-- Security model: Access control is handled at the application layer (Next.js API routes)
-- using Prisma, which connects as the postgres user and bypasses RLS anyway.
-- ============================================

-- Disable RLS on all public tables
ALTER TABLE IF EXISTS public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.r69_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pbp_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.r69_analytics DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (if any were created)
DROP POLICY IF EXISTS "games_select_policy" ON public.games;
DROP POLICY IF EXISTS "r69_events_select_policy" ON public.r69_events;
DROP POLICY IF EXISTS "pbp_events_select_policy" ON public.pbp_events;
DROP POLICY IF EXISTS "teams_select_policy" ON public.teams;
DROP POLICY IF EXISTS "r69_analytics_select_policy" ON public.r69_analytics;

-- Verify RLS status (should all be 'f' for false)
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('games', 'r69_events', 'pbp_events', 'teams', 'r69_analytics')
ORDER BY tablename;

-- Summary
SELECT
    'RLS has been DISABLED on all public tables.' as status,
    'This is appropriate because:' as reason,
    '1. App uses direct DB connection (Prisma) which bypasses RLS' as reason_1,
    '2. No user authentication - public statistics dashboard' as reason_2,
    '3. Access control handled in Next.js API routes' as reason_3;
