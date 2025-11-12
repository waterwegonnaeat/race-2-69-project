#!/bin/bash

# Setup Vercel Environment Variables
echo "Setting up DATABASE_URL in Vercel..."
echo ""

# Read DATABASE_URL from .env.local or .env
if [ -f .env.local ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"')
elif [ -f .env ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
else
    echo "Error: No .env or .env.local file found!"
    exit 1
fi

echo "Found DATABASE_URL: ${DATABASE_URL:0:30}..."
echo ""
echo "Adding to Vercel environments..."
echo ""

# Add to Production
echo "1/3 Adding to Production..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

# Add to Preview
echo ""
echo "2/3 Adding to Preview..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview

# Add to Development
echo ""
echo "3/3 Adding to Development..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL development

echo ""
echo "✅ DATABASE_URL has been added to all Vercel environments!"
echo ""
echo "Next steps:"
echo "1. Vercel will automatically redeploy your app"
echo "2. Wait 1-2 minutes for the deployment to complete"
echo "3. Check your site: https://race-2-69-project.vercel.app"
echo ""
echo "You can view your environment variables at:"
echo "https://vercel.com/waterwegonnaeats-projects/race-2-69-project/settings/environment-variables"
