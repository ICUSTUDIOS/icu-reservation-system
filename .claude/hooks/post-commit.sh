#!/bin/bash

# Post-commit hook for ICU Reservation System
# This hook runs after a successful commit

echo "🎉 Commit successful!"

# 1. Update local statistics
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# 2. Log commit to development log
LOG_FILE=".claude/development.log"
if [ ! -f "$LOG_FILE" ]; then
    mkdir -p .claude
    echo "# Development Log" > "$LOG_FILE"
    echo "" >> "$LOG_FILE"
fi

echo "## [$TIMESTAMP] Commit: $COMMIT_HASH" >> "$LOG_FILE"
echo "$COMMIT_MSG" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 3. Check if database migrations are needed
if git diff HEAD^ HEAD --name-only | grep -q "scripts/.*\.sql$"; then
    echo "⚠️  Database migration files detected!"
    echo "   Remember to apply these migrations to your database:"
    git diff HEAD^ HEAD --name-only | grep "scripts/.*\.sql$"
fi

# 4. Check if environment variables changed
if git diff HEAD^ HEAD --name-only | grep -q "\.env\.example$"; then
    echo "⚠️  Environment variables may have changed!"
    echo "   Review .env.example and update your .env.local accordingly"
fi

# 5. Check if dependencies changed
if git diff HEAD^ HEAD --name-only | grep -q "package\.json$"; then
    echo "📦 Package dependencies changed!"
    echo "   Run 'npm install' to update your dependencies"
fi

# 6. Remind about testing
echo "🧪 Remember to test your changes:"
echo "   - Run 'npm run dev' to test locally"
echo "   - Check the booking flow works correctly"
echo "   - Verify points calculations if modified"

# 7. Git status summary
echo ""
echo "📊 Current branch status:"
git status -sb