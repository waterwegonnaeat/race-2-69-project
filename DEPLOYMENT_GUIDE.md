# 🚀 Deployment Guide - R69W Dashboard

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Your database accessible online

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/race-2-69-project.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add your environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables:**
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste your database connection string when prompted.

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

---

## Free Database Options

### Option A: Neon (Recommended for Vercel)
- **Free tier:** 0.5 GB storage, always available
- **Setup:** [neon.tech](https://neon.tech)
- **Steps:**
  1. Create account at neon.tech
  2. Create new project
  3. Copy connection string
  4. Add to Vercel environment variables

### Option B: Supabase
- **Free tier:** 500 MB database, 2 GB bandwidth
- **Setup:** [supabase.com](https://supabase.com)
- **Steps:**
  1. Create account at supabase.com
  2. Create new project
  3. Get connection string from Settings > Database
  4. Add to Vercel environment variables

### Option C: Railway
- **Free tier:** $5 credit/month
- **Setup:** [railway.app](https://railway.app)
- **Steps:**
  1. Create account at railway.app
  2. Create new PostgreSQL database
  3. Copy connection string
  4. Add to Vercel environment variables

### Option D: ElephantSQL
- **Free tier:** 20 MB storage
- **Setup:** [elephantsql.com](https://www.elephantsql.com)

---

## Migration Steps if Using New Database

If you're setting up a new database for production:

1. **Copy your schema:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Update DATABASE_URL in production:**
   ```bash
   vercel env add DATABASE_URL production
   ```

3. **Deploy database schema:**
   ```bash
   npx prisma db push
   ```

4. **Optional: Seed data**
   You'll need to run your data fetching scripts against the new database:
   ```bash
   python scripts/fetch_historical_data.py --seasons 5
   ```

---

## Environment Variables Needed

Add these to your Vercel project:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

---

## Alternative Free Hosting Platforms

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Railway (Full-Stack)
- Best if you want database + app together
- $5 free credit/month
- Deploy directly from GitHub
- [railway.app](https://railway.app)

### Render
- Free tier for web services
- Free PostgreSQL (90 days)
- [render.com](https://render.com)

---

## Custom Domain (Optional)

Once deployed on Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Vercel handles HTTPS automatically

---

## Continuous Deployment

With GitHub + Vercel:
- Every push to `main` branch automatically deploys
- Pull requests get preview deployments
- Rollback to any previous deployment with one click

---

## Build Settings (Auto-detected by Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify DATABASE_URL is set in environment variables
- Check Vercel build logs for specific errors

### Database Connection Issues
- Ensure your database allows connections from Vercel IPs
- Use connection string with `?sslmode=require` for PostgreSQL
- Check database is not sleeping (some free tiers sleep after inactivity)

### Missing Environment Variables
```bash
vercel env ls
vercel env add VARIABLE_NAME
```

---

## Cost Summary

| Service | Cost | Limits |
|---------|------|--------|
| Vercel | Free | 100GB bandwidth/month |
| Neon DB | Free | 0.5 GB storage |
| Supabase DB | Free | 500 MB database |
| Railway | $5 credit/month | Renews monthly |

**Total: $0/month** for most hobby projects!

---

## Next Steps After Deployment

1. ✅ Test your live site
2. ✅ Set up custom domain (optional)
3. ✅ Enable Vercel Analytics (free)
4. ✅ Set up monitoring
5. ✅ Share your live URL!

---

## Example Vercel Configuration

Create `vercel.json` in your project root (optional):

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Deployment: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Prisma + Vercel: [prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
