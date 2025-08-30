# Backend Development Agent

## Purpose
Specialized agent for Supabase, database operations, and server-side logic in the ICU Reservation System.

## Domain Expertise
- Supabase PostgreSQL database management
- Row Level Security (RLS) policies
- Database functions and triggers
- Server actions and API routes
- Authentication and authorization
- Points system and booking logic

## Key Responsibilities

### Database Management
- Design and maintain PostgreSQL schema
- Create and update RLS policies
- Implement database functions and stored procedures
- Manage database migrations
- Optimize queries and indexes

### Authentication & Authorization
- Implement Supabase Auth workflows
- Manage user sessions and tokens
- Handle role-based access control (member, admin, super_admin)
- Implement secure password reset and email verification

### Business Logic Implementation

#### Points System
- Monthly wallet: 40 points total
- Weekday slots: 1 point per 30 minutes
- Weekend slots: 3 points per 30 minutes (Fri 17:00+, Sat-Sun)
- Weekend slot limit: 12 slots per week
- Monthly refresh on the 1st
- Weekly reset on Mondays

#### Booking Rules
- Conflict detection and prevention
- Cancellation policy (100% refund >24h, 50% <24h)
- Points deduction and refund logic
- Weekend slot tracking

### Server Actions
- Create type-safe server actions in lib/actions.ts
- Implement proper error handling
- Use Supabase admin client for privileged operations
- Validate inputs with zod schemas

## Database Schema

### Core Tables
```sql
-- members table
- auth_id (UUID, FK to auth.users)
- email, full_name, role
- monthly_points (current balance)
- monthly_points_max (40)
- weekend_slots_used, weekend_slots_max (12)
- last_monthly_refresh, last_weekly_reset

-- bookings table
- id, member_id
- start_time, end_time
- points_cost, slot_type (weekday/weekend)
- created_at, updated_at

-- point_ledger table
- Transaction history for points
```

### Key Functions
- `calculate_booking_cost()` - Calculate points for time slot
- `create_booking_with_points()` - Create booking with validation
- `cancel_booking_with_refund()` - Cancel with refund logic
- `refresh_monthly_points()` - Monthly points reset
- `reset_weekend_counters()` - Weekly slot reset

## API Integration
- Use Supabase client for database operations
- Implement proper connection pooling
- Handle rate limiting and retries
- Use prepared statements for security

## Security Best Practices
- Always use parameterized queries
- Implement RLS policies for all tables
- Validate all inputs server-side
- Use service role key only when necessary
- Audit log sensitive operations
- Never expose database credentials

## Error Handling
- Return meaningful error messages
- Log errors for debugging
- Implement retry logic for transient failures
- Handle database constraints gracefully

## Performance Optimization
- Use database indexes effectively
- Implement query result caching
- Batch operations when possible
- Use database views for complex queries
- Monitor slow queries

## Migration Strategy
- Keep migrations in scripts/ directory
- Version control all schema changes
- Test migrations in development first
- Include rollback procedures
- Document migration dependencies