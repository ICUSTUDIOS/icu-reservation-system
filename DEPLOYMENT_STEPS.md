# 🚀 Step-by-Step Render Deployment

## Prerequisites
✅ GitHub account
✅ Render account (sign up at render.com)
✅ Current Supabase credentials

## Step 1: Push Code to GitHub

```bash
# If not already a git repo
git init
git remote add origin https://github.com/YOUR_USERNAME/icu-reservation-system.git

# Push the code
git add .
git commit -m "Deploy to Render"
git push -u origin main
```

## Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

## Step 3: Deploy via Dashboard

### Option A: Blueprint Deployment (Recommended)
1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Select `render-simple.yaml` as the blueprint
4. Click **"Apply"**

### Option B: Manual Deployment
1. Click **"New +"** → **"PostgreSQL"**
   - Name: `icu-db`
   - Database: `icu_reservation`
   - User: `icu_admin`
   - Region: Oregon (US West)
   - Plan: Free
   - Click **"Create Database"**

2. Click **"New +"** → **"Web Service"**
   - Connect GitHub repo
   - Name: `icu-reservation`
   - Runtime: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
   - Plan: Free
   - Click **"Create Web Service"**

## Step 4: Configure Environment Variables

Go to your web service dashboard → **Environment** tab and add:

### Required Variables
```bash
# Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# Database (auto-set by Render)
DATABASE_URL=[Auto-populated]

# Generate these
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://icu-reservation.onrender.com
```

### How to Get Supabase Keys:
1. Log into Supabase Dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Initialize Database

### Connect to Database
1. In Render Dashboard → Database → **"Connect"**
2. Click **"External Connection"**
3. Copy the External Database URL

### Run Migration
```bash
# On your local machine
psql "YOUR_EXTERNAL_DATABASE_URL" < scripts/render-migration.sql

# Or use Render Shell
# Dashboard → Web Service → Shell tab
cat scripts/render-migration.sql | psql $DATABASE_URL
```

## Step 6: Migrate Data from Supabase

### Export from Supabase
```bash
# Get Supabase connection string from Supabase Dashboard
SUPABASE_DB="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Export data
pg_dump "$SUPABASE_DB" \
  --data-only \
  --table=members \
  --table=bookings \
  --table=applications \
  > supabase-export.sql
```

### Import to Render
```bash
# Import to Render database
psql "YOUR_RENDER_DATABASE_URL" < supabase-export.sql
```

## Step 7: Verify Deployment

### Check Health
```bash
curl https://icu-reservation.onrender.com/api/health
```

### Expected Response:
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "latency": "23ms"
  }
}
```

## Step 8: Test Application

1. **Visit your app**: https://icu-reservation.onrender.com
2. **Test login**: Use existing credentials
3. **Check booking system**: Create a test booking
4. **Verify admin panel**: /admin (if you're an admin)

## Step 9: Custom Domain (Optional)

1. Dashboard → Settings → **"Custom Domains"**
2. Add your domain: `reservation.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   Type: CNAME
   Name: reservation
   Value: icu-reservation.onrender.com
   ```

## Step 10: Monitor & Maintain

### Enable Notifications
1. Dashboard → Settings → **"Notifications"**
2. Enable email alerts for:
   - Deploy failures
   - Service downtime
   - Database issues

### Set Up Auto-Deploy
1. Dashboard → Settings → **"Build & Deploy"**
2. Enable **"Auto-Deploy"** from main branch

## 🎉 Deployment Complete!

Your app is now live at:
- Render URL: https://icu-reservation.onrender.com
- Health Check: https://icu-reservation.onrender.com/api/health
- Admin Panel: https://icu-reservation.onrender.com/admin

## Troubleshooting

### Build Fails
```bash
# Check logs
Dashboard → Logs → Build logs

# Common fixes:
- Ensure all dependencies in package.json
- Check Node version (>=18)
- Verify environment variables
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check if tables exist
psql $DATABASE_URL -c "\dt"
```

### Application Errors
```bash
# Check runtime logs
Dashboard → Logs → Service logs

# Common issues:
- Missing environment variables
- Database not initialized
- Port binding issues
```

## Support
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/YOUR_USERNAME/icu-reservation-system/issues

---

**Next Steps:**
1. Monitor for 24 hours
2. Set up backups
3. Configure monitoring alerts
4. Plan scaling strategy