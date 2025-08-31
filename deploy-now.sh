#!/bin/bash

echo "🚀 Deploying ICU Reservation System to Render"
echo "=============================================="

# Configuration
REPO_URL="https://github.com/relaxshadow/icu_reservation_system"
SERVICE_NAME="icu-reservation-system"
SUPABASE_URL="https://jkcsowmshwhpeejwfmph.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3Nvd21zaHdocGVlandmbXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzI0NTEsImV4cCI6MjA2NTA0ODQ1MX0._6tNiSIRC46W5_0ZIV_EXk-HD1J_ZUa557V4yhBLD98"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3Nvd21zaHdocGVlandmbXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MjQ1MSwiZXhwIjoyMDY1MDQ4NDUxfQ.jDYcbnWkAdRp5Ymmby2V85hDgdb_Ed95HyqS6-DI1ZE"

# Step 1: Try to push to GitHub
echo "📌 Step 1: Preparing code for deployment..."
git add -A
git commit -m "Deploy to Render - $(date +%Y-%m-%d_%H:%M:%S)" || echo "No changes to commit"

# Step 2: Create deployment configuration
echo "📌 Step 2: Creating deployment configuration..."

cat > render-deploy-config.json << EOF
{
  "services": [
    {
      "type": "web",
      "name": "${SERVICE_NAME}",
      "repo": "${REPO_URL}",
      "autoDeploy": "yes",
      "branch": "main",
      "buildCommand": "npm ci && npm run build",
      "startCommand": "npm run start",
      "envVars": [
        {
          "key": "NODE_ENV",
          "value": "production"
        },
        {
          "key": "PORT",
          "value": "10000"
        },
        {
          "key": "NEXT_PUBLIC_SUPABASE_URL",
          "value": "${SUPABASE_URL}"
        },
        {
          "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "value": "${SUPABASE_ANON_KEY}"
        },
        {
          "key": "SUPABASE_SERVICE_ROLE_KEY",
          "value": "${SUPABASE_SERVICE_KEY}"
        }
      ],
      "healthCheckPath": "/api/health",
      "plan": "free",
      "region": "oregon"
    }
  ]
}
EOF

echo "✅ Configuration created"

# Step 3: Generate deployment URL
echo "📌 Step 3: Generating deployment URL..."

DEPLOY_URL="https://render.com/deploy?repo=${REPO_URL}"

echo ""
echo "=============================================="
echo "🎯 DEPLOYMENT READY!"
echo "=============================================="
echo ""
echo "Since we need authentication to deploy via API,"
echo "please use one of these methods:"
echo ""
echo "METHOD 1: One-Click Deploy (Recommended)"
echo "----------------------------------------"
echo "Open this URL in your browser:"
echo ""
echo "  ${DEPLOY_URL}"
echo ""
echo "METHOD 2: Manual Deploy"
echo "----------------------------------------"
echo "1. Go to: https://dashboard.render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect repo: ${REPO_URL}"
echo "4. Use the settings from render-deploy-config.json"
echo ""
echo "METHOD 3: Use Render CLI (if installed)"
echo "----------------------------------------"
echo "render up"
echo ""
echo "=============================================="
echo "📊 Your app will be available at:"
echo "https://${SERVICE_NAME}.onrender.com"
echo "=============================================="

# Try to open the browser
if command -v xdg-open > /dev/null; then
    xdg-open "${DEPLOY_URL}"
elif command -v open > /dev/null; then
    open "${DEPLOY_URL}"
elif command -v start > /dev/null; then
    start "${DEPLOY_URL}"
else
    echo "Please manually open: ${DEPLOY_URL}"
fi