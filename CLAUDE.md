# ICU Reservation System - Claude Code Configuration

## Project Overview
The ICU Reservation System is a Next.js 15.2.4 application with Supabase backend for managing studio space reservations using a points-based booking system.

## Quick Start Commands
```bash
# Development
npm run dev              # Start development server on http://localhost:3000

# Testing
.claude/hooks/test-runner.sh  # Run comprehensive tests

# Build & Deploy
npm run build           # Build for production
npm run start           # Start production server

# Database
# Use MCP Supabase tools when available (mcp__supabase__*)
```

## Critical Business Rules

### Points System
- **Monthly Wallet**: 40 points per member
- **Weekday Rate**: 1 point per 30-minute slot
- **Weekend Rate**: 3 points per 30-minute slot (Fri 17:00+, Sat-Sun all day)
- **Weekend Limit**: Maximum 12 weekend slots per week
- **Monthly Reset**: Points refresh on the 1st of each month
- **Weekly Reset**: Weekend slot counter resets every Monday

### Cancellation Policy
- **>24 hours notice**: 100% points refund
- **<24 hours notice**: 50% points refund
- Weekend slots are returned to weekly allowance upon cancellation

### User Roles
- **member**: Standard user with booking privileges
- **admin**: Can manage users and bookings
- **super_admin**: Full system access

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **UI**: Radix UI components, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **State**: React hooks, Supabase realtime subscriptions

### Project Structure
```
icu_reservation_system/
├── .claude/                 # Claude Code configuration
│   ├── agents/             # Specialized AI agents
│   └── hooks/              # Development workflow hooks
├── app/                    # Next.js app directory
│   ├── (landing)/         # Public landing page
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── apply/             # Application form
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── dashboard/        # Dashboard components
│   ├── landing/          # Landing page components
│   └── ui/               # Radix UI components
├── lib/                   # Utilities and actions
│   ├── supabase/         # Supabase clients
│   └── *-actions.ts      # Server actions
├── hooks/                 # Custom React hooks
├── scripts/              # Database migrations
└── styles/               # Global styles
```

## Development Workflow

### 1. Before Starting Development
```bash
# Check environment variables
cat .env.local  # Should contain SUPABASE keys

# Install dependencies
npm install

# Run tests
.claude/hooks/test-runner.sh
```

### 2. Component Development Guidelines
- **Client Components**: Add `'use client'` directive
- **Server Components**: Default (no directive)
- **Naming**: Use kebab-case for files (e.g., `time-slot-picker.tsx`)
- **Hooks**: Prefix with `use` (e.g., `useBookings.ts`)

### 3. Database Operations
Always use MCP Supabase tools when available:
- `mcp__supabase__execute_sql` - For SQL queries
- `mcp__supabase__apply_migration` - For schema changes
- `mcp__supabase__list_tables` - For table inspection

### 4. Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] No hardcoded secrets
- [ ] Points calculations are correct
- [ ] Weekend slot limits enforced
- [ ] Cancellation refunds work
- [ ] UI is responsive
- [ ] Dark theme works

### 5. Deployment Process
1. Ensure all tests pass
2. Check environment variables in Vercel
3. Push to `main` branch
4. Vercel auto-deploys
5. Monitor deployment logs

## Specialized Agents

### Available Agents
1. **frontend-agent**: React, Next.js, UI development
2. **backend-agent**: Supabase, database, server logic
3. **testing-agent**: Testing, debugging, quality assurance
4. **devops-agent**: Deployment, monitoring, infrastructure

### Using Agents
Agents are automatically detected and used based on task context. They provide specialized expertise for their domains.

## Hooks Configuration

### Available Hooks
- **pre-commit.sh**: Validates code before commits
- **post-commit.sh**: Logs commits and provides reminders
- **pre-build.sh**: Prepares environment for builds
- **test-runner.sh**: Comprehensive testing suite

### Activating Hooks
```bash
# Make hooks executable (already done)
chmod +x .claude/hooks/*.sh

# Run specific hook
.claude/hooks/test-runner.sh
```

## Common Tasks

### Add New Component
```bash
# 1. Create component file (kebab-case)
touch components/dashboard/new-feature.tsx

# 2. Use existing UI components
import { Button } from "@/components/ui/button"

# 3. Follow dark theme styling
className="bg-background text-foreground"
```

### Modify Points System
```sql
-- Edit scripts/simple-one-wallet-migration.sql
-- Update calculate_booking_cost function
-- Test with mcp__supabase__execute_sql
```

### Debug Booking Issues
```typescript
// Check hooks/useBookings.ts
// Verify lib/booking-actions.ts
// Monitor Supabase logs
```

### Update User Permissions
```sql
-- Use RLS policies in Supabase
-- Update via mcp__supabase__execute_sql
```

## Security Guidelines

### Never Expose
- `SUPABASE_SERVICE_ROLE_KEY` - Keep in server-only code
- Database connection strings
- User passwords or tokens

### Always Validate
- User inputs (use zod schemas)
- API responses
- File uploads
- URL parameters

### Use Proper Auth
- Check user roles before operations
- Use RLS policies in database
- Validate sessions in middleware

## Performance Optimization

### Frontend
- Use dynamic imports for code splitting
- Implement proper memoization
- Optimize images (currently disabled)
- Use loading.tsx for loading states

### Backend
- Index database queries
- Use connection pooling
- Cache frequently accessed data
- Batch operations when possible

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# TypeScript errors are ignored in next.config.mjs
# To see actual errors:
npx tsc --noEmit
```

#### Database Connection
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
# Verify in Supabase dashboard
```

#### Points Not Deducting
- Check `create_booking_with_points` function
- Verify member has sufficient points
- Check weekend slot limits

#### Login Issues
- Verify Supabase Auth settings
- Check email templates
- Review middleware.ts

## Environment Variables

### Required Variables
```bash
# Public (client-side)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Private (server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Setting Up New Environment
1. Copy from `.env.example` (if exists)
2. Get values from Supabase dashboard
3. Never commit `.env.local`

## Database Schema

### Core Tables
- **members**: User profiles with points and role
- **bookings**: Reservation records with costs
- **point_ledger**: Transaction history
- **booking_slots**: Available time slots

### Key Functions
- `calculate_booking_cost()`: Calculates points for booking
- `create_booking_with_points()`: Creates booking with validation
- `cancel_booking_with_refund()`: Handles cancellations
- `refresh_monthly_points()`: Monthly points reset
- `reset_weekend_counters()`: Weekly slot reset

## Git Workflow

### Branch Strategy
- `main`: Production branch
- `staging`: Testing branch
- `feature/*`: New features
- `fix/*`: Bug fixes

### Commit Messages
Follow conventional commits:
```
feat: add weekend slot validation
fix: correct points calculation
docs: update booking documentation
refactor: optimize database queries
```

## Monitoring & Alerts

### Key Metrics
- Response time < 200ms
- Error rate < 0.1%
- Database CPU < 80%
- Uptime > 99.9%

### Where to Check
- Vercel Dashboard: Deployment status
- Supabase Dashboard: Database metrics
- Browser Console: Client errors
- Network Tab: API performance

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Radix UI Docs](https://radix-ui.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project-Specific
- Database migrations: `/scripts/`
- Business logic: `/lib/*-actions.ts`
- UI components: `/components/ui/`
- Hooks: `/hooks/`

## Important Notes

### Current Limitations
- Build errors are ignored (`ignoreBuildErrors: true`)
- ESLint errors are ignored (`ignoreDuringBuilds: true`)
- Image optimization is disabled (`unoptimized: true`)
- Some dependencies use "latest" version (potential instability)

### Recommended Improvements
1. Enable TypeScript strict checking
2. Fix and enable ESLint
3. Pin dependency versions
4. Add comprehensive test suite
5. Implement error tracking (Sentry)
6. Add performance monitoring
7. Set up CI/CD pipeline

## Quick Reference

### Test Everything
```bash
.claude/hooks/test-runner.sh
```

### Check Database
```sql
-- Via MCP tools
mcp__supabase__execute_sql
SELECT * FROM members WHERE auth_id = 'user_id';
```

### Debug Frontend
```javascript
console.log('Component state:', { props, state })
```

### Monitor Performance
```bash
# Check bundle size
du -sh .next

# Check build time
time npm run build
```

---

**Remember**: Always prioritize security, validate inputs, and test thoroughly before deploying!