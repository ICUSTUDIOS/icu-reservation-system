#!/bin/bash

# Pre-commit hook for ICU Reservation System
# This hook runs before every commit to ensure code quality

echo "🔍 Running pre-commit checks..."

# 1. Check for TypeScript errors
echo "📝 Checking TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before committing."
    exit 1
fi

# 2. Run ESLint
echo "🔎 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint errors found. Please fix them before committing."
    exit 1
fi

# 3. Check for console.log statements in production code
echo "🔍 Checking for console.log statements..."
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')
if [ ! -z "$FILES" ]; then
    for file in $FILES; do
        if grep -q "console.log" "$file"; then
            echo "⚠️  Warning: console.log found in $file"
            echo "   Consider removing or using proper logging"
        fi
    done
fi

# 4. Check for exposed secrets
echo "🔐 Checking for exposed secrets..."
FILES=$(git diff --cached --name-only)
for file in $FILES; do
    # Check for Supabase keys
    if grep -qE "(SUPABASE_SERVICE_ROLE_KEY|supabase_service_role_key)" "$file"; then
        if [[ ! "$file" =~ \.(env|env\.local|env\.example)$ ]]; then
            echo "❌ Potential secret exposed in $file"
            echo "   Service role keys should only be in .env files"
            exit 1
        fi
    fi
    
    # Check for hardcoded URLs that might be sensitive
    if grep -qE "https://.*\.supabase\.(co|io)" "$file"; then
        if [[ ! "$file" =~ \.(md|env|env\.local|env\.example)$ ]]; then
            echo "⚠️  Warning: Hardcoded Supabase URL in $file"
            echo "   Consider using environment variables"
        fi
    fi
done

# 5. Validate package.json if changed
if git diff --cached --name-only | grep -q "package.json"; then
    echo "📦 Validating package.json..."
    node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "❌ Invalid package.json format"
        exit 1
    fi
fi

# 6. Check component naming conventions
echo "📁 Checking file naming conventions..."
FILES=$(git diff --cached --name-only --diff-filter=A | grep -E 'components/.*\.(tsx|jsx)$')
for file in $FILES; do
    filename=$(basename "$file")
    # Check if component files are kebab-case
    if ! echo "$filename" | grep -qE '^[a-z]+(-[a-z]+)*\.(tsx|jsx)$'; then
        echo "⚠️  Warning: Component file $filename should use kebab-case naming"
    fi
done

# 7. Check for TODO comments
echo "📋 Checking for TODO comments..."
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')
TODO_COUNT=0
for file in $FILES; do
    TODOS=$(grep -n "TODO\|FIXME\|HACK" "$file" 2>/dev/null)
    if [ ! -z "$TODOS" ]; then
        echo "📌 TODOs found in $file:"
        echo "$TODOS"
        TODO_COUNT=$((TODO_COUNT + 1))
    fi
done
if [ $TODO_COUNT -gt 0 ]; then
    echo "⚠️  Found TODO/FIXME/HACK comments in $TODO_COUNT file(s)"
    echo "   Consider creating issues for these items"
fi

echo "✅ Pre-commit checks passed!"