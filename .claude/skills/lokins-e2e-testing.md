# LOKINS E2E Testing Skill

## Trigger
User invokes `/lokins-e2e-testing` or asks for end-to-end testing of the ICU Reservation System.

## Description
Run comprehensive end-to-end tests of the ICU Reservation System (LOKINS platform) using Playwright MCP. Tests the full user journey from registration through booking management.

## Test Suites

### Suite 1: Public Pages
1. **Landing Page**
   - Navigate to `/`
   - Verify hero section loads
   - Check features section
   - Verify points explainer
   - Test navigation links

2. **Application Page**
   - Navigate to `/apply`
   - Fill application form
   - Submit and verify success

### Suite 2: Authentication
1. **Sign Up Flow**
   - Navigate to `/auth/sign-up`
   - Fill registration form
   - Verify email sent notification

2. **Login Flow**
   - Navigate to `/auth/login`
   - Enter credentials
   - Verify redirect to dashboard

### Suite 3: User Dashboard
1. **Dashboard Load**
   - Verify header with user info
   - Check wallet bar (points display)
   - Verify time slot picker
   - Check my bookings section

2. **Booking Creation**
   - Select date
   - Select available time slots
   - Confirm booking
   - Verify points deduction
   - Check booking appears in list

3. **Booking Cancellation**
   - Find existing booking
   - Click cancel
   - Confirm cancellation
   - Verify refund applied

### Suite 4: Admin Dashboard
1. **Admin Access**
   - Login as admin
   - Navigate to `/admin`
   - Verify admin tabs load

2. **User Management**
   - View user list
   - Test user search
   - Verify role display

3. **Booking Management**
   - View all bookings
   - Filter bookings
   - Test booking actions

4. **Application Reviews**
   - View pending applications
   - Test approve/reject flow

5. **User Invitation**
   - Fill invitation form
   - Send invitation
   - Verify success

## Execution Steps

```typescript
// Start testing
console.log("Starting LOKINS E2E Test Suite")

// Test 1: Landing Page
browser_navigate("http://localhost:3000")
browser_snapshot()
browser_wait_for({ text: "LOKINS" })

// Test 2: Auth Flow
browser_navigate("http://localhost:3000/auth/login")
browser_snapshot()
// ... continue with form filling

// Test 3: Dashboard
// ... after login
browser_navigate("http://localhost:3000/dashboard")
browser_snapshot()

// Test 4: Admin (if admin credentials)
browser_navigate("http://localhost:3000/admin")
browser_snapshot()
```

## Prerequisites
- Dev server running (`npm run dev`)
- Test user credentials available
- Database populated with test data
- Playwright MCP connected

## Success Criteria
- [ ] All pages load without errors
- [ ] Forms submit successfully
- [ ] Bookings create and cancel correctly
- [ ] Points system calculates accurately
- [ ] Admin functions work for admin users
- [ ] No console errors
- [ ] Network requests succeed

## Report Format
```markdown
## E2E Test Results - [Date]

### Summary
- Total tests: X
- Passed: X
- Failed: X

### Detailed Results
| Test | Status | Notes |
|------|--------|-------|
| Landing Page | PASS/FAIL | details |
| Login Flow | PASS/FAIL | details |
...

### Issues Found
1. Issue description with steps to reproduce
2. ...

### Screenshots
- landing-page.png
- dashboard.png
- ...
```
