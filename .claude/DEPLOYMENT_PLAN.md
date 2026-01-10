# ICU Reservation System - Comprehensive Deployment Plan

## Executive Summary

This document outlines the complete deployment strategy for the ICU Reservation System (LOKINS). The system uses:
- **Frontend**: Next.js 15 deployed on Vercel
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Repository**: GitHub (relaxshadow/icu_reservation_system)

---

## Phase 1: Local Setup & Verification

### 1.1 Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] Git configured with SSH/HTTPS access
- [ ] Supabase account with project access
- [ ] Vercel account with team access
- [ ] Environment variables file (.env.local)

### 1.2 Local Development Setup
```bash
# Clone repository
git clone https://github.com/relaxshadow/icu_reservation_system.git
cd icu_reservation_system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add environment variables
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# Start development server
npm run dev
```

### 1.3 Verification Points
| Check | Command | Expected Result |
|-------|---------|-----------------|
| Dev server starts | `npm run dev` | Server on http://localhost:3000 |
| Landing page loads | Visit `/` | Hero section visible |
| Auth pages work | Visit `/auth/login` | Login form displays |
| Build succeeds | `npm run build` | No fatal errors |

---

## Phase 2: Database Setup (Supabase)

### 2.1 Supabase Project Configuration
**Project**: `supabase-kurybines-erdves`
**Region**: EU Central 1 (eu-central-1)
**Project ID**: `jkcsowmshwhpeejwfmph`

### 2.2 Database Schema Migration
```sql
-- Run via Supabase MCP or Dashboard
-- mcp__supabase__apply_migration(project_id, "initial_schema", sql)

-- Core tables: members, bookings, point_ledger
-- Functions: create_booking_with_points, cancel_booking_with_refund
-- Triggers: auto-refresh points, reset weekend counters
```

### 2.3 Required Database Functions
| Function | Purpose | Trigger |
|----------|---------|---------|
| `calculate_booking_cost` | Pricing calculation | Called by booking |
| `create_booking_with_points` | Create booking + deduct points | Manual call |
| `cancel_booking_with_refund` | Cancel + refund points | Manual call |
| `refresh_monthly_points` | Reset monthly points | 1st of month |
| `reset_weekend_counters` | Reset weekend slots | Every Monday |

### 2.4 RLS Policies
```sql
-- Members: Users can only see/update own record
-- Bookings: Users can only see/cancel own bookings
-- Point Ledger: Users can only see own transactions
-- Admin override: role = 'admin' or 'super_admin'
```

### 2.5 Database Verification
```typescript
// Run via MCP
mcp__supabase__list_tables(project_id, ["public"])
mcp__supabase__execute_sql(project_id, "SELECT * FROM members LIMIT 1")
mcp__supabase__get_advisors(project_id, "security")
```

---

## Phase 3: Authentication Setup

### 3.1 Supabase Auth Configuration
**Dashboard → Authentication → Settings**

| Setting | Value |
|---------|-------|
| Site URL | https://your-domain.vercel.app |
| Redirect URLs | https://your-domain.vercel.app/*, http://localhost:3000/* |
| Email confirmations | Required |
| Password min length | 8 |

### 3.2 Email Templates
Configure in Supabase Dashboard → Authentication → Email Templates

| Template | File Location |
|----------|---------------|
| Confirm signup | `supabase-email-templates/confirm-signup.html` |
| Magic link | `supabase-email-templates/magic-link.html` |
| Password recovery | `supabase-email-templates/recovery.html` |
| Invite user | `supabase-email-templates/invite-user-exclusive.html` |

### 3.3 Auth Flow Verification
1. Test signup → email confirmation → login
2. Test password reset flow
3. Test admin invitation flow
4. Verify session persistence

---

## Phase 4: Vercel Deployment

### 4.1 Project Configuration
**Team**: YNTOYG's projects
**Team ID**: `team_bXGoVPLik9NpZnURRhYUR5N0`

### 4.2 Connect Repository
```typescript
// Via Vercel Dashboard or CLI
// Project → Settings → Git → Connect Repository
// Select: relaxshadow/icu_reservation_system
// Branch: main (production), staging (preview)
```

### 4.3 Environment Variables
**Dashboard → Project → Settings → Environment Variables**

| Variable | Environments | Value |
|----------|-------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | All | https://jkcsowmshwhpeejwfmph.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | All | eyJ... (from Supabase) |
| SUPABASE_SERVICE_ROLE_KEY | Production, Preview | eyJ... (from Supabase) |

### 4.4 Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 4.5 Deployment Steps
```typescript
// Using MCP
mcp__vercel__deploy_to_vercel()

// Monitor deployment
mcp__vercel__list_deployments(projectId, teamId)
mcp__vercel__get_deployment_build_logs(deploymentId, teamId, 100)
```

---

## Phase 5: Domain Configuration (Optional)

### 5.1 Custom Domain Setup
```typescript
// Check availability
mcp__vercel__check_domain_availability_and_price(["lokins.lt", "icureservation.com"])
```

### 5.2 DNS Configuration
| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 5.3 SSL Certificate
- Automatic via Vercel
- Verify after DNS propagation (up to 48h)

---

## Phase 6: Post-Deployment Verification

### 6.1 Production Checklist
- [ ] Landing page loads correctly
- [ ] Login/signup works
- [ ] Dashboard accessible after login
- [ ] Bookings create successfully
- [ ] Points deduction works
- [ ] Cancellation refunds correctly
- [ ] Admin dashboard accessible
- [ ] User invitation works
- [ ] No console errors
- [ ] Mobile responsive

### 6.2 E2E Testing
```typescript
// Use Playwright MCP for comprehensive testing
browser_navigate(productionUrl)
browser_snapshot()
// Run full test suite per testing-agent.md
```

### 6.3 Performance Checks
- Lighthouse score > 80
- First Contentful Paint < 2s
- Time to Interactive < 4s

### 6.4 Security Audit
```typescript
mcp__supabase__get_advisors(project_id, "security")
// Review all security recommendations
```

---

## Phase 7: Monitoring & Maintenance

### 7.1 Log Monitoring
```typescript
// Check logs regularly
mcp__supabase__get_logs(project_id, "postgres")
mcp__supabase__get_logs(project_id, "auth")
mcp__supabase__get_logs(project_id, "api")
```

### 7.2 Database Maintenance
- Monitor point refresh triggers (1st of month)
- Monitor weekend reset triggers (Mondays)
- Check for orphaned bookings
- Review point ledger for anomalies

### 7.3 Backup Strategy
- Supabase automatic daily backups
- Point-in-time recovery available (Pro plan)
- Export critical data monthly

---

## Rollback Procedures

### If Deployment Fails
1. Check build logs for errors
2. Fix issues locally
3. Push fix and redeploy
4. If urgent: promote last working deployment

### If Database Issue
1. Use Supabase point-in-time recovery
2. Or restore from daily backup
3. Document what caused issue
4. Fix migration before reapplying

### Emergency Contacts
- Supabase Status: status.supabase.com
- Vercel Status: vercel.com/status
- GitHub Status: githubstatus.com

---

## Quick Reference Commands

### MCP Operations
```typescript
// Supabase
mcp__supabase__list_projects()
mcp__supabase__execute_sql(project_id, query)
mcp__supabase__apply_migration(project_id, name, sql)
mcp__supabase__get_logs(project_id, service)

// Vercel
mcp__vercel__list_teams()
mcp__vercel__list_projects(teamId)
mcp__vercel__deploy_to_vercel()
mcp__vercel__get_deployment_build_logs(idOrUrl, teamId)

// Playwright (Testing)
mcp__playwright__browser_navigate(url)
mcp__playwright__browser_snapshot()
mcp__playwright__browser_click(element, ref)
```

### Git Operations
```bash
git status
git add .
git commit -m "message"
git push origin staging
git checkout main && git merge staging && git push origin main
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Complete deployment plan |

---

## Notes

- Always test on staging before production
- Never commit .env files
- Keep Supabase service role key secure
- Document all database schema changes
- Run security advisors after RLS changes
