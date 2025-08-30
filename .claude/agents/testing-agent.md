# Testing & Quality Assurance Agent

## Purpose
Specialized agent for testing, debugging, and ensuring code quality in the ICU Reservation System.

## Domain Expertise
- Unit and integration testing
- End-to-end testing strategies
- Performance testing
- Security testing
- Debugging Next.js applications
- Database testing with Supabase

## Testing Strategy

### Frontend Testing
- Component testing with React Testing Library
- User interaction testing
- Form validation testing
- Responsive design verification
- Accessibility testing (WCAG compliance)
- Visual regression testing

### Backend Testing
- Database function testing
- API endpoint testing
- Authentication flow testing
- Points calculation verification
- Booking logic validation
- RLS policy testing

### Integration Testing
- Full user journey testing
- Payment/points flow testing
- Real-time subscription testing
- Email notification testing
- Role-based access testing

## Test Scenarios

### Critical User Flows
1. **Registration & Login**
   - New user signup
   - Email verification
   - Password reset
   - Session management

2. **Booking Flow**
   - View available slots
   - Make a booking
   - Check points deduction
   - Cancel booking
   - Verify refund

3. **Admin Operations**
   - User management
   - Booking oversight
   - Report generation
   - System configuration

### Edge Cases
- Concurrent booking attempts
- Points exhaustion scenarios
- Weekend slot limit enforcement
- Network failure handling
- Session timeout handling

## Debugging Techniques

### Client-Side Debugging
```javascript
// Debug hooks
console.log('Component render:', { props, state })

// React DevTools integration
if (typeof window !== 'undefined') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__
}

// Network inspection
console.log('API call:', { url, method, body })
```

### Server-Side Debugging
```javascript
// Server action debugging
console.log('[Server Action]', { action, params, user })

// Database query logging
console.log('[DB Query]', { sql, params, result })
```

### Supabase Debugging
- Use Supabase Dashboard logs
- Monitor RLS policy evaluations
- Check function execution logs
- Review auth logs

## Performance Testing

### Metrics to Monitor
- Page load time (< 3s)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Database query performance
- API response times

### Load Testing Scenarios
- Multiple concurrent users
- Peak booking times
- Database connection pooling
- Real-time subscription scaling
- Image loading optimization

## Security Testing

### Authentication Tests
- Password strength validation
- Session hijacking prevention
- CSRF token validation
- Rate limiting effectiveness

### Authorization Tests
- Role-based access control
- RLS policy enforcement
- Admin privilege escalation prevention
- Data isolation between users

### Input Validation
- SQL injection prevention
- XSS attack prevention
- File upload validation
- Form submission tampering

## Quality Checks

### Code Quality
- TypeScript type coverage
- ESLint rule compliance
- Unused code detection
- Bundle size analysis
- Dependency vulnerability scanning

### Database Quality
- Schema consistency
- Index effectiveness
- Query optimization
- Data integrity constraints
- Backup and recovery testing

## Monitoring & Logging

### Application Monitoring
- Error tracking (client & server)
- Performance metrics
- User behavior analytics
- API usage patterns

### Database Monitoring
- Query performance
- Connection pool status
- Storage usage
- Backup status

## Bug Reporting Template
```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [...]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- User Role: [Member/Admin]

### Additional Context
[Screenshots, logs, etc.]
```

## Testing Commands
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="Booking"

# Debug mode
npm run test:debug
```