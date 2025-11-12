@echo off
echo Setting up DATABASE_URL in Vercel...
echo.

set DATABASE_URL=postgresql://postgres:_Eyj4f-GKK47QJzorf*R@db.jvrxzmiarcqgpobnmnyj.supabase.co:5432/postgres

echo Found DATABASE_URL
echo.
echo Adding to Vercel environments...
echo.

echo 1/3 Adding to Production...
echo %DATABASE_URL% | vercel env add DATABASE_URL production

echo.
echo 2/3 Adding to Preview...
echo %DATABASE_URL% | vercel env add DATABASE_URL preview

echo.
echo 3/3 Adding to Development...
echo %DATABASE_URL% | vercel env add DATABASE_URL development

echo.
echo ✅ DATABASE_URL has been added to all Vercel environments!
echo.
echo Next steps:
echo 1. Vercel will automatically redeploy your app
echo 2. Wait 1-2 minutes for the deployment to complete
echo 3. Check your site: https://race-2-69-project.vercel.app
echo.
echo You can view your environment variables at:
echo https://vercel.com/waterwegonnaeats-projects/race-2-69-project/settings/environment-variables
echo.
pause
