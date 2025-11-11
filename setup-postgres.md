# Local PostgreSQL Setup (Windows)

## Step 1: Install PostgreSQL

### Option A: Official Installer (Recommended)
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Default settings are fine
4. Remember the password you set for the `postgres` user!
5. Port: 5432 (default)

### Option B: Using Chocolatey
```bash
choco install postgresql
```

## Step 2: Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is running
pg_isready

# Should output: localhost:5432 - accepting connections
```

If not running, start it:
- Search for "services" in Windows
- Find "postgresql-x64-xx"
- Right-click → Start

## Step 3: Create Database

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL (enter your password when prompted)
psql -U postgres

# In psql, create the database:
CREATE DATABASE r69w_db;

# Verify it was created:
\l

# Exit psql:
\q
```

## Step 4: Update .env File

Your `.env` should have:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/r69w_db?schema=public"
```

Replace `YOUR_PASSWORD` with the password you set during installation.

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

## Troubleshooting

### Can't connect to PostgreSQL
1. Check PostgreSQL is running in Services
2. Verify port 5432 is not blocked by firewall
3. Try: `psql -U postgres -h localhost`

### Wrong password
1. Reset password:
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'new_password';
```

### psql command not found
Add PostgreSQL to your PATH:
1. Search "Environment Variables" in Windows
2. Edit "Path" variable
3. Add: `C:\Program Files\PostgreSQL\16\bin`
