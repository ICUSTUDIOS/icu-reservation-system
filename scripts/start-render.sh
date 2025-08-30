#!/bin/bash

# Render Startup Script
echo "🚀 Starting ICU Reservation System on Render..."

# Set environment
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-10000}

echo "📊 Environment:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - Database: ${DATABASE_URL:0:30}..."

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🗄️ Running database migrations..."
  psql $DATABASE_URL < scripts/render-migration.sql
  echo "✅ Migrations complete"
fi

# Start the application
echo "🎯 Starting Next.js application on port $PORT..."
npm run start