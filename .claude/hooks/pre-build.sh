#!/bin/bash

# Pre-build hook for ICU Reservation System
# Runs before building the application

echo "🏗️  Preparing build..."

# 1. Verify environment variables
echo "🔐 Checking environment variables..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${MISSING_VARS[@]}"
    echo "   Please set these in your .env.local file"
    exit 1
fi

# 2. Clean previous build artifacts
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# 3. Check Node version
echo "📦 Checking Node version..."
REQUIRED_NODE_VERSION="18"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
    echo "⚠️  Warning: Node version $NODE_VERSION detected"
    echo "   Recommended version is $REQUIRED_NODE_VERSION or higher"
fi

# 4. Validate TypeScript configuration
echo "⚙️  Validating TypeScript configuration..."
if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json not found"
    exit 1
fi

# 5. Check for dependency issues
echo "📚 Checking dependencies..."
npm ls >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Dependency tree has issues"
    echo "   Run 'npm install' to fix"
fi

# 6. Optimize images
echo "🖼️  Checking images..."
IMAGE_COUNT=$(find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | wc -l)
if [ $IMAGE_COUNT -gt 0 ]; then
    echo "   Found $IMAGE_COUNT images in public directory"
    # Note: Image optimization is disabled in next.config.mjs
    echo "   ℹ️  Image optimization is currently disabled"
fi

# 7. Create build info file
echo "📝 Creating build info..."
BUILD_INFO=".next/build-info.json"
mkdir -p .next
cat > "$BUILD_INFO" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)"
}
EOF

echo "✅ Pre-build checks completed!"