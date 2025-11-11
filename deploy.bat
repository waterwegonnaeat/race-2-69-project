@echo off
echo ========================================
echo  R69W Dashboard - Automated Deployment
echo ========================================
echo.

echo Step 1: Checking Vercel CLI...
vercel --version
if %errorlevel% neq 0 (
    echo ERROR: Vercel CLI not found!
    exit /b 1
)
echo ✓ Vercel CLI found
echo.

echo Step 2: Opening Vercel login page...
echo Please complete login in your browser...
start https://vercel.com/login
echo.
echo After logging in, press any key to continue...
pause > nul

echo.
echo Step 3: Deploying to Vercel...
vercel --yes

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add your DATABASE_URL environment variable at:
echo    https://vercel.com/dashboard
echo.
echo 2. Or add it via CLI:
echo    vercel env add DATABASE_URL
echo.
echo 3. Deploy to production:
echo    vercel --prod
echo.
pause
