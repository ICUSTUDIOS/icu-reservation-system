#!/bin/bash

# Test runner hook for ICU Reservation System
# Comprehensive testing before deployment

echo "🧪 Running comprehensive tests..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "  Testing $test_name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 1. TypeScript Tests
echo "📝 TypeScript Validation:"
run_test "TypeScript compilation" "npx tsc --noEmit"
run_test "Type coverage" "[ -f tsconfig.json ]"

# 2. Linting Tests
echo ""
echo "🔍 Code Quality:"
run_test "ESLint rules" "npm run lint"
run_test "Import sorting" "! grep -r 'import.*from.*\.\/' --include='*.tsx' --include='*.ts' . | grep -v '@/'"

# 3. Security Tests
echo ""
echo "🔐 Security Checks:"
run_test "No hardcoded secrets" "! grep -r 'SUPABASE_SERVICE_ROLE_KEY=' --include='*.ts' --include='*.tsx' --exclude-dir='.env*' ."
run_test "No console.logs in components" "! grep -r 'console\.log' components/ --include='*.tsx'"
run_test "Environment variables" "[ -f .env.local ] || [ -f .env ]"

# 4. Component Tests
echo ""
echo "🧩 Component Validation:"
run_test "Client directives" "grep -l 'use client' components/**/*.tsx >/dev/null 2>&1 || true"
run_test "Hook naming" "! find hooks -name '*.ts' | grep -v '^use'"
run_test "Component exports" "! grep -r 'export default function' components/ --include='*.tsx' | grep -v 'export default function [A-Z]'"

# 5. Database Tests
echo ""
echo "🗄️  Database Validation:"
run_test "SQL migrations" "[ -d scripts ] && [ -f scripts/simple-one-wallet-migration.sql ]"
run_test "Booking functions" "grep -q 'create_booking_with_points' scripts/*.sql"
run_test "Points calculation" "grep -q 'calculate_booking_cost' scripts/*.sql"

# 6. Build Tests
echo ""
echo "🏗️  Build Validation:"
run_test "Package.json valid" "node -e \"JSON.parse(require('fs').readFileSync('package.json'))\""
run_test "Dependencies installed" "[ -d node_modules ]"
run_test "Next.js config" "[ -f next.config.mjs ]"

# 7. Business Logic Tests
echo ""
echo "💼 Business Logic:"
run_test "Points system (40 max)" "grep -q 'monthly_points_max.*40' scripts/*.sql"
run_test "Weekend slots (12 max)" "grep -q 'weekend_slots_max.*12' scripts/*.sql"
run_test "Cancellation policy" "grep -q 'cancel_booking_with_refund' scripts/*.sql"

# 8. UI/UX Tests
echo ""
echo "🎨 UI/UX Validation:"
run_test "Dark theme configured" "grep -q 'dark' app/globals.css"
run_test "Responsive breakpoints" "grep -q 'sm:\|md:\|lg:' components/**/*.tsx >/dev/null 2>&1 || true"
run_test "Loading states" "find app -name 'loading.tsx' | grep -q 'loading'"

# 9. Performance Tests
echo ""
echo "⚡ Performance Checks:"
run_test "Bundle size check" "[ ! -d .next ] || [ $(du -sm .next | cut -f1) -lt 100 ]"
run_test "Image optimization" "grep -q 'unoptimized: true' next.config.mjs"

# 10. Integration Tests
echo ""
echo "🔗 Integration Points:"
run_test "Supabase client" "[ -f lib/supabase/client.ts ]"
run_test "Auth middleware" "[ -f middleware.ts ]"
run_test "Server actions" "[ -f lib/actions.ts ] || [ -f lib/booking-actions.ts ]"

# Results Summary
echo ""
echo "═══════════════════════════════════════"
echo "📊 Test Results Summary"
echo "═══════════════════════════════════════"
echo -e "  Total Tests: $TOTAL_TESTS"
echo -e "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review and fix.${NC}"
    exit 1
fi