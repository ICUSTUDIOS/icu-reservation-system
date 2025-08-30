#!/bin/bash

# Automated Render Deployment Script
# This script will help deploy your app to Render

echo "🚀 ICU Reservation System - Render Deployment Script"
echo "===================================================="
echo ""

# Check if environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    if [ -f .env.local ]; then
        echo "✅ Found .env.local file"
        source .env.local
    else
        echo "⚠️  No .env.local file found"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
        echo "Please add it to your .env.local file"
        exit 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
        echo "Please add it to your .env.local file"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
        echo "Please add it to your .env.local file"
        exit 1
    fi
    
    echo "✅ All required environment variables found"
    echo ""
}

# Create Render deployment configuration
create_render_config() {
    echo "📝 Creating Render deployment configuration..."
    
    cat > render-deploy.json << EOF
{
  "name": "icu-reservation-system",
  "env": "node",
  "region": "oregon",
  "plan": "free",
  "buildCommand": "npm ci && npm run build",
  "startCommand": "npm run start",
  "healthCheckPath": "/api/health",
  "envVars": {
    "NODE_ENV": "production",
    "PORT": "10000",
    "NEXT_PUBLIC_SUPABASE_URL": "$NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "$NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY": "$SUPABASE_SERVICE_ROLE_KEY"
  }
}
EOF
    
    echo "✅ Configuration created"
    echo ""
}

# Display deployment instructions
show_instructions() {
    echo "📋 DEPLOYMENT INSTRUCTIONS"
    echo "=========================="
    echo ""
    echo "Since we can't directly deploy from here, please follow these steps:"
    echo ""
    echo "1. PUSH YOUR CODE TO GITHUB:"
    echo "   git push origin staging:main"
    echo ""
    echo "2. GO TO RENDER.COM:"
    echo "   https://dashboard.render.com/new/web"
    echo ""
    echo "3. CONNECT YOUR REPOSITORY:"
    echo "   - Select: relaxshadow/icu_reservation_system"
    echo "   - Branch: main"
    echo ""
    echo "4. CONFIGURE SERVICE:"
    echo "   - Name: icu-reservation-system"
    echo "   - Region: Oregon (US West)"
    echo "   - Runtime: Node"
    echo "   - Build Command: npm ci && npm run build"
    echo "   - Start Command: npm run start"
    echo "   - Instance Type: Free"
    echo ""
    echo "5. ADD ENVIRONMENT VARIABLES:"
    echo "   Copy these values to Render dashboard:"
    echo ""
    echo "   NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
    echo "   SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
    echo ""
    echo "6. CLICK 'CREATE WEB SERVICE'"
    echo ""
    echo "Your app will be live in ~10 minutes at:"
    echo "https://icu-reservation-system.onrender.com"
    echo ""
}

# Create a deployment checklist
create_checklist() {
    cat > DEPLOY_NOW.md << 'EOF'
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
EOF
    
    echo "✅ Created DEPLOY_NOW.md with quick instructions"
    echo ""
}

# Main execution
echo "Starting deployment preparation..."
echo ""

check_env_vars
create_render_config
create_checklist
show_instructions

echo "===================================================="
echo "✅ DEPLOYMENT PREPARATION COMPLETE!"
echo "===================================================="
echo ""
echo "📄 Files created:"
echo "   - render-deploy.json (deployment config)"
echo "   - DEPLOY_NOW.md (quick guide)"
echo ""
echo "⏱️  Estimated time to deploy: 15 minutes"
echo "💰 Cost: $0 (Free tier)"
echo ""
echo "Ready to deploy! Follow the instructions above."