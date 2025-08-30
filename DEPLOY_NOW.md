# 🚀 Deploy Right Now - Copy & Paste Guide

## Step 1: Open Terminal
```bash
git push origin staging:main
```

## Step 2: Open Render
[Click here to open Render](https://dashboard.render.com/new/web)

## Step 3: Quick Setup
1. Connect GitHub repo: `relaxshadow/icu_reservation_system`
2. Use these exact settings:
   - **Name**: `icu-reservation-system`
   - **Build**: `npm ci && npm run build`
   - **Start**: `npm run start`

## Step 4: Environment Variables
Copy your Supabase keys from `.env.local` to Render

## Step 5: Deploy!
Click "Create Web Service" and wait 10 minutes

## Your URLs:
- App: https://icu-reservation-system.onrender.com
- Admin: https://icu-reservation-system.onrender.com/admin
