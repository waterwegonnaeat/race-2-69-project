# Supabase Connection Guide for Vercel

## The Problem

Your Vercel deployment is failing to connect to the Supabase database with error:
```
Can't reach database server at `db.jvrxzmiarcqgpobnmnyj.supabase.co:6543`
```

## The Solution

You need to update the DATABASE_URL on Vercel with the correct Supabase connection pooler URL.

## Steps to Fix

### 1. Get the Correct Connection String from Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (ID: `jvrxzmiarcqgpobnmnyj`)
3. Click on "Settings" (gear icon) in the left sidebar
4. Click on "Database"
5. Scroll down to "Connection string"
6. Select "Connection pooling" mode (NOT "Session mode")
7. Copy the connection string

**Important:** Make sure you're using the **Connection Pooling** string, which should look like:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

OR for IPv4:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true
```

### 2. Update Vercel Environment Variable

Run this command in your terminal:

```bash
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
```

When prompted, paste your connection string from Step 1.

### 3. Redeploy

After updating the environment variable, trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger redeploy with updated DATABASE_URL"
git push
```

Or use Vercel CLI:
```bash
vercel --prod
```

## Troubleshooting

### Test Your Connection String Locally

Before adding to Vercel, test the connection string:

```bash
node scripts/test-db-connection.js "YOUR_CONNECTION_STRING_HERE"
```

If this works locally, it should work on Vercel.

### Common Issues

1. **Wrong pooler endpoint**: Make sure you're using port 6543 (pooler) not 5432 (direct)
2. **Missing pgbouncer parameter**: IPv4 connections need `?pgbouncer=true`
3. **Incorrect password**: The password in the connection string must match your database password
4. **IPv6 vs IPv4**: Supabase has two pooler endpoints - try the other one if one doesn't work

### Verify on Vercel

After updating:

```bash
vercel env ls
```

You should see DATABASE_URL listed under Production environment.

## Alternative: Use Supabase Direct Connection with Prisma Data Proxy

If connection pooling continues to fail, consider using Supabase's Session Mode connection or Prisma Data Proxy for better serverless compatibility.
