# ICU Reservation System - Workflow Memo

## Application Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: Radix UI components with Tailwind CSS
- **State Management**: React hooks with Supabase realtime
- **Deployment**: Configured for Vercel

### Core Application Flow

#### 1. Landing Page (`/`)
- **Route**: `app/(landing)/page.tsx`
- **Components**: LandingHeader, LandingHero, FeaturesSection, PointsExplainer, LandingFooter
- **Purpose**: Marketing page with auth links

#### 2. Authentication Flow
- **Login**: `app/auth/login/page.tsx`
- **Sign Up**: `app/auth/sign-up/page.tsx`
- **Middleware**: `middleware.ts` handles session management across all routes
- **Auth Components**: `login-form.tsx`, `signup-form.tsx`

#### 3. Main Dashboard (`/dashboard`)
- **Route**: `app/dashboard/page.tsx`
- **Server Component**: Handles auth check, user role detection, data fetching
- **Client Wrapper**: `DashboardClientWrapper` manages UI state
- **Key Features**:
  - User authentication verification
  - Admin role detection
  - Booking data fetching (user + all bookings)
  - Weekend slot tracking

#### 4. Application System (`/apply`)
- **Route**: `app/apply/page.tsx`
- **Component**: `application-form.tsx`
- **Purpose**: New member application system

#### 5. Admin Panel (`/admin`)
- **Route**: `app/admin/page.tsx`
- **Components**: Various admin dashboard components
- **Access**: Role-based (admin/super_admin only)

### Key Components & Functionality

#### Time Slot Booking System
- **Component**: `TimeSlotPicker` (`time-slot-picker.tsx`)
- **Database**: Uses Supabase functions for slot reservation/cancellation
- **Weekend Slots**: Limited slots system (6 max per user)
- **Real-time Updates**: Supabase realtime subscriptions

#### Booking Management
- **Component**: `MyBookings` (`my-bookings.tsx`)
- **Features**: View/cancel user bookings
- **Database Actions**: `booking-actions.ts`

#### User Management
- **Authentication**: `useAuth.ts` hook
- **Member Data**: `useMember.ts` hook
- **Role System**: Members table with role-based access

#### Admin Features
- **User Management**: `admin-user-management.tsx`
- **Booking Management**: `admin-booking-management.tsx`
- **Reports**: `admin-reports.tsx`
- **Statistics**: `admin-stats.tsx`
- **User Invitations**: `admin-invite-user.tsx`

### Database Schema (Supabase)
- **members**: User profiles with roles and weekend slot tracking
- **bookings**: Reservation records
- **booking_slots**: Available time slots
- **RLS Policies**: Row-level security for data access

### Current State Analysis

#### Potential Issues Identified:
1. **Environment Variables**: Properly configured in `.env.local`
2. **Next.js Config**: Has build error ignoring (potential concern)
3. **Supabase Connection**: Client properly configured with realtime
4. **Dependencies**: Some dependencies use "latest" versions (potential instability)

#### Build Configuration Issues:
- TypeScript errors ignored (`ignoreBuildErrors: true`)
- ESLint errors ignored (`ignoreDuringBuilds: true`)
- Image optimization disabled (`unoptimized: true`)

#### Common Localhost Issues to Check:
1. **Environment Variables**: ✅ Present and configured
2. **Port Conflicts**: Default Next.js port 3000
3. **Database Connection**: Supabase URLs/keys properly set
4. **Build Errors**: Currently ignored, may cause runtime issues

### Development Workflow
1. **Start**: `npm run dev` (localhost:3000)
2. **Build**: `npm run build`
3. **Production**: `npm run start`

### Recommended Next Steps for Troubleshooting:
1. Run `npm run build` to check for TypeScript/build errors
2. Check browser console for runtime errors
3. Verify Supabase connection and database queries
4. Review middleware authentication flow
5. Check for component hydration issues (client/server mismatch)

### Security Considerations:
- Service role key properly stored in environment
- RLS policies should be verified
- Authentication middleware properly configured
- Admin access properly restricted

## Development Notes:
- Uses React 19 with Next.js 15 (cutting edge versions)
- Dark theme as default
- Responsive design with mobile-first approach
- Extensive use of Radix UI components for accessibility