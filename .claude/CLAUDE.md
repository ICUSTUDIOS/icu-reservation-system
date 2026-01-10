# ICU Reservation System - Claude Code Project Instructions

## Project Overview

**ICU Reservation System** is a modern, full-stack booking platform for studio reservations. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase. Uses a points-based allocation system for fair resource distribution.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15.2.4, React 19, TypeScript 5 |
| Styling | Tailwind CSS 3.4.17, shadcn/ui (Radix) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| State | React hooks, Server Actions, Supabase Realtime |
| Forms | react-hook-form, Zod validation |
| Deployment | Vercel |

## Architecture

```
app/                    # Next.js App Router
├── (landing)/         # Public landing page
├── admin/             # Admin dashboard (protected)
├── apply/             # Application form (public)
├── auth/              # Login/signup routes
├── dashboard/         # User dashboard (protected)

components/
├── admin/             # Admin-specific components
├── dashboard/         # User dashboard components
├── landing/           # Landing page components
├── ui/                # shadcn/ui primitives

lib/
├── supabase/          # Supabase clients (browser, server, admin)
├── *-actions.ts       # Server actions for all operations

hooks/                 # Custom React hooks (useAuth, useBookings, useMember)
```

## Database Schema

### Core Tables

**members**
- `id`, `auth_id`, `email`, `full_name`, `role`
- `monthly_points` (current), `monthly_points_max` (40)
- `weekend_slots_used`, `weekend_slots_max` (12)
- `last_monthly_refresh`, `last_weekly_reset`

**bookings**
- `id`, `member_id`, `start_time`, `end_time`
- `points_cost`, `slot_type` (weekday/weekend), `status`

**point_ledger**
- `member_id`, `delta`, `reason`, `ref_booking_id`

### Pricing Logic

- **Weekday** (Mon-Thu, Fri 00:00-17:00): 1 point per 30min
- **Weekend** (Fri 17:00-24:00, Sat-Sun): 3 points per 30min
- **Monthly Budget**: 40 points (refreshes 1st of month)
- **Weekend Limit**: 12 slots per week (resets Monday)

### Key Database Functions

```sql
-- Calculate booking cost
calculate_booking_cost(start_time, end_time) → total_cost, is_weekend, slot_count

-- Create booking with points deduction
create_booking_with_points(member_auth_id, start_time, end_time)

-- Cancel with refund (100% if >24h, 50% if <24h)
cancel_booking_with_refund(member_auth_id, booking_id)
```

## Environment Variables

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MCP Servers (for Claude Code)
SUPABASE_ACCESS_TOKEN=        # Personal access token from supabase.com/dashboard/account/tokens
VERCEL_API_TOKEN=             # From vercel.com/account/tokens
```

## MCP Integration

This project has three MCP servers configured in `.mcp.json`:

### Playwright MCP
- Browser automation with persistent sessions
- User data stored in `.playwright-browser-data/`
- Session state in `.playwright-storage.json`

### Supabase MCP
- Direct database access for queries and migrations
- Use `mcp__supabase__execute_sql` for queries
- Use `mcp__supabase__apply_migration` for schema changes
- Use `mcp__supabase__get_logs` for debugging

### Vercel MCP
- Deployment management
- Build logs and deployment status
- Domain configuration

## Development Workflow

### Before Making Changes

1. **Always read files before editing** - Never propose blind changes
2. **Check existing patterns** - Follow established code style
3. **Verify imports** - Use existing components from `@/components/ui`
4. **Test database changes** - Use staging project first

### Code Standards

- **TypeScript**: Strict mode, explicit types for exports
- **Components**: Server Components by default, `"use client"` only when needed
- **Styling**: Tailwind classes, use `cn()` utility for conditionals
- **Forms**: react-hook-form + Zod for validation
- **API**: Server Actions (`"use server"`) over API routes

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Types: Inline or in component file
- Actions: `*-actions.ts`

## Common Tasks

### Add a new component
```bash
# Use shadcn/ui for UI primitives
npx shadcn@latest add [component-name]

# Custom components go in components/
```

### Database migration
```bash
# Use Supabase MCP
mcp__supabase__apply_migration(project_id, name, query)

# Or run scripts/
supabase db push
```

### Deploy to Vercel
```bash
# Use Vercel MCP for deployment
mcp__vercel__deploy_to_vercel()

# Check deployment logs
mcp__vercel__get_deployment_build_logs(idOrUrl, teamId)
```

## Testing Guidelines

### E2E Testing with Playwright MCP

1. Navigate to pages using `browser_navigate`
2. Take snapshots with `browser_snapshot`
3. Interact using `browser_click`, `browser_type`
4. Verify state with `browser_evaluate`

### Database Testing

1. Use staging/branch database for testing
2. Never test on production
3. Always clean up test data

## Security Considerations

- **Auth**: All protected routes verified by middleware
- **RLS**: Row Level Security enabled on all tables
- **Admin**: Service role key only on server-side
- **Inputs**: All user inputs validated with Zod
- **XSS**: React auto-escapes, no dangerouslySetInnerHTML

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Auth email templates configured
- [ ] Domain configured (if custom)
- [ ] Build passes without errors

## Troubleshooting

### Supabase connection issues
```typescript
// Check if Supabase is configured
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Supabase not configured')
}
```

### Auth redirect loops
- Check `middleware.ts` excluded paths
- Verify Supabase auth settings
- Check cookie configuration

### Build failures
- TypeScript errors ignored in build
- ESLint disabled for faster builds
- Check Vercel build logs

## Project-Specific Rules

1. **Points system is sacred** - Never bypass points validation
2. **Weekend pricing** - Always validate slot type pricing
3. **Refund policy** - 100% >24h, 50% <24h, no exceptions
4. **Admin actions** - Always audit log admin operations
5. **User data** - Never expose other users' bookings

## Agent Usage

This project has specialized agents in `.claude/agents/`:

- **frontend-agent.md** - UI/UX, components, styling
- **backend-agent.md** - Database, auth, server actions
- **testing-agent.md** - E2E testing, verification
- **deployment-agent.md** - Vercel, production concerns

Use the appropriate agent for domain-specific tasks.
