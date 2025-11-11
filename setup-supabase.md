# Quick Supabase Setup (5 minutes)

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email

## Step 2: Create New Project
1. Click "New Project"
2. Name: `r69w-dashboard`
3. Database Password: Choose a strong password (SAVE THIS!)
4. Region: Choose closest to you
5. Click "Create new project"
6. Wait ~2 minutes for setup

## Step 3: Get Connection String
1. Click "Settings" (gear icon on left sidebar)
2. Click "Database"
3. Scroll to "Connection string" section
4. Click the "URI" tab
5. Copy the connection string (it looks like: `postgresql://postgres.xxx...`)

## Step 4: Update .env File

Open your `.env` file and replace the DATABASE_URL line with your Supabase URL:

```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Make sure to:
- Replace `[YOUR-PASSWORD]` with your actual password
- Keep the entire URL in quotes

## Step 5: Run Setup Commands

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Add sample data
npm run db:seed

# Start the app!
npm run dev
```

## Done!

Open http://localhost:3000 and you should see your dashboard with 3 sample games!
