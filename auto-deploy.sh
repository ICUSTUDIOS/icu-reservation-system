#!/bin/bash

echo "🚀 Attempting automated Render deployment..."
echo ""

# Since we can't directly access Render API without authentication,
# let's create a one-click deployment URL

REPO_URL="https://github.com/relaxshadow/icu_reservation_system"
RENDER_YAML="https://raw.githubusercontent.com/relaxshadow/icu_reservation_system/main/render.yaml"

# Create the one-click deploy URL
DEPLOY_URL="https://render.com/deploy?repo=${REPO_URL}"

echo "📋 QUICK DEPLOYMENT LINK"
echo "========================"
echo ""
echo "Click this link to deploy directly to Render:"
echo ""
echo "🔗 ${DEPLOY_URL}"
echo ""
echo "Or use the Render Blueprint Deploy button:"
echo ""
echo "[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](${DEPLOY_URL})"
echo ""
echo "This will:"
echo "✅ Automatically create your web service"
echo "✅ Use the render.yaml configuration"
echo "✅ Set up the free tier hosting"
echo ""
echo "You'll just need to add your Supabase keys!"
echo ""

# Create a markdown file with the deploy button
cat > DEPLOY_BUTTON.md << EOF
# Deploy to Render

Click the button below to deploy this application to Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/relaxshadow/icu_reservation_system)

## After Clicking:

1. Render will fork the repository
2. Create the web service automatically
3. You'll need to add these environment variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`SUPABASE_SERVICE_ROLE_KEY\`

## Get Your Supabase Keys:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the three values

## Your App Will Be Live At:

https://icu-reservation-system.onrender.com

---

**Deployment Time:** ~10-15 minutes
**Cost:** FREE ($0/month)
EOF

echo "✅ Created DEPLOY_BUTTON.md with one-click deploy button"
echo ""
echo "To deploy manually, visit:"
echo "https://dashboard.render.com/new/blueprint"
echo ""
echo "And paste your repository URL:"
echo "${REPO_URL}"