# 🚀 Quick Deploy to Render (Vercel → Render Migration)

## What We're Doing
Moving your Next.js app from **Vercel** to **Render** while keeping **Supabase** as your database.

## Prerequisites
✅ Your existing Supabase project (no changes needed!)
✅ GitHub repository
✅ 15 minutes

---

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub
```bash
git push origin staging:main
```
Your repo: https://github.com/relaxshadow/icu_reservation_system

### Step 2: Sign Up for Render
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub
4. Authorize Render to access your repos

### Step 3: Deploy Your App

#### Option A: One-Click Blueprint (Easiest! 🎯)
1. Click **"New"** → **"Blueprint"**
2. Connect repo: `relaxshadow/icu_reservation_system`
3. Render detects `render.yaml` automatically
4. Click **"Apply"**
5. Done! Skip to Step 4.

#### Option B: Manual Setup
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `icu-reservation-system`
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free ($0/month)
4. Click **"Create Web Service"**

### Step 4: Add Supabase Credentials

In Render Dashboard → **Environment** tab, add your existing Supabase keys:

| Variable | Where to Find It | Example |
|----------|-----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | `eyJhbGc...` |

**How to get these:**
1. Log into https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the three values

### Step 5: Deploy!
1. Click **"Save Changes"** after adding environment variables
2. Render will automatically redeploy
3. Wait 5-10 minutes for build to complete
4. Your app is live! 🎉

---

## ✅ Verify Everything Works

### Check These URLs:
- **Your App**: https://icu-reservation-system.onrender.com
- **Health Check**: https://icu-reservation-system.onrender.com/api/health
- **Admin Panel**: https://icu-reservation-system.onrender.com/admin

### Test Functions:
1. ✅ Login with existing credentials
2. ✅ Make a booking
3. ✅ Check admin panel (if you're admin)
4. ✅ Test on mobile

---

## 🎯 That's It!

Your app is now:
- ✅ Hosted on Render (instead of Vercel)
- ✅ Still using your Supabase database
- ✅ All data intact
- ✅ Free tier ($0/month)

### What Changed:
- **Hosting**: Vercel → Render
- **URL**: vercel.app → onrender.com

### What Stayed the Same:
- **Database**: Still Supabase ✅
- **Users & Data**: All preserved ✅
- **Features**: Everything works ✅

---

## 📈 Optional Next Steps

### Custom Domain
1. Dashboard → **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS records

### Auto-Deploy
Already enabled! Push to main branch = automatic deployment

### Scaling
When ready, upgrade from Free to Starter ($7/month) for:
- No spin-down delays
- More resources
- Better performance

---

## 🆘 Troubleshooting

### App Not Loading?
- Check environment variables are set correctly
- View logs: Dashboard → **Logs**

### Can't Login?
- Verify Supabase keys are correct
- Check they're in the right fields

### Build Failed?
- Make sure you're on main branch
- Check build logs for errors

---

## 📞 Support
- Render Community: https://community.render.com
- Render Docs: https://render.com/docs
- Your Supabase project stays at: https://app.supabase.com

---

**Time Estimate**: 15 minutes total
**Cost**: $0 (Free tier)
**Downtime**: None (Vercel stays up until you update DNS)