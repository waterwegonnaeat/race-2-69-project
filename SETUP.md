# R69W Dashboard - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Choose one of these options:

#### Option A: Supabase (Easiest - Free Cloud Database)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Create `.env.local` file:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE r69w_db;
CREATE USER r69w_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE r69w_db TO r69w_user;
```

3. Create `.env.local`:
```env
DATABASE_URL="postgresql://r69w_user:your_password@localhost:5432/r69w_db?schema=public"
```

### 3. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Seed Sample Data (Optional)

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema Overview

The R69W Dashboard uses 5 main tables:

- **games** - Game metadata, scores, status
- **r69_events** - Records when teams hit 69 first
- **pbp_events** - Play-by-play event data
- **teams** - Team statistics and aggregates
- **r69_analytics** - Derived metrics and analytics

---

## Python Data Pipeline Setup

To ingest live game data:

1. Install Python dependencies:
```bash
cd scripts
pip install -r requirements.txt
```

2. Create `scripts/.env`:
```env
DATABASE_URL=postgresql://...
ESPN_API_BASE=https://site.api.espn.com/apis/site/v2/sports/basketball
LEAGUE=mens-college-basketball
```

3. Run data ingestion:
```bash
python scripts/data_ingestion.py
```

4. Set up cron job or scheduled task to run every 10-15 minutes during games.

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

Make sure you created `.env.local` in the project root (not inside any folder).

### "Can't reach database server"

- Check if PostgreSQL is running: `pg_isready`
- Verify connection string format
- For Supabase: Make sure you replaced `[YOUR-PASSWORD]`

### Migration errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push
```

### "prisma command not found"

```bash
npm install
npx prisma --version
```

---

## Next Steps

1. ✅ Database set up
2. ✅ Tables created
3. Run the app: `npm run dev`
4. Ingest game data with Python script
5. Explore the dashboard!

---

## Production Deployment

For production on Vercel:

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Database: Use Supabase or Railway for production PostgreSQL.
