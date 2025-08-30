# DevOps & Deployment Agent

## Purpose
Specialized agent for deployment, CI/CD, monitoring, and infrastructure management for the ICU Reservation System.

## Domain Expertise
- Vercel deployment configuration
- Supabase project management
- Environment variable management
- CI/CD pipeline setup
- Performance monitoring
- Security hardening

## Deployment Strategy

### Vercel Configuration
```javascript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key"
  }
}
```

### Environment Management
```bash
# Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Staging (.env.staging)
# Production (.env.production)
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Database Management

### Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore procedures monthly

### Migration Workflow
1. Develop migration in `scripts/`
2. Test in development environment
3. Apply to staging
4. Verify functionality
5. Apply to production
6. Monitor for issues

### Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Storage usage alerts
- Slow query logging

## Performance Optimization

### Vercel Optimization
- Edge functions for API routes
- Image optimization with Next.js
- Static generation where possible
- ISR for dynamic content
- CDN caching strategies

### Bundle Optimization
```javascript
// next.config.mjs additions
{
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/*']
  }
}
```

### Monitoring Setup
- Vercel Analytics integration
- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring
- Custom metrics dashboard

## Security Hardening

### Headers Configuration
```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### Environment Security
- Rotate API keys quarterly
- Use secret management service
- Implement rate limiting
- Enable audit logging
- Regular security scans

## Scaling Strategy

### Horizontal Scaling
- Vercel auto-scaling for functions
- Supabase connection pooling
- CDN distribution
- Database read replicas (if needed)

### Performance Targets
- Response time: < 200ms (p95)
- Uptime: 99.9%
- Error rate: < 0.1%
- Page load: < 3s

## Disaster Recovery

### Incident Response
1. Identify issue severity
2. Notify stakeholders
3. Implement immediate fix
4. Root cause analysis
5. Post-mortem documentation
6. Preventive measures

### Rollback Procedures
```bash
# Vercel rollback
vercel rollback [deployment-url]

# Database rollback
psql -h [host] -U [user] -d [database] < backup.sql

# Git rollback
git revert HEAD
git push origin main
```

## Monitoring Alerts

### Critical Alerts
- Application down
- Database connection failure
- Authentication service failure
- Payment processing failure

### Warning Alerts
- High error rate (> 1%)
- Slow response time (> 1s)
- Low points balance
- High database CPU (> 80%)

## Documentation

### Runbook Template
```markdown
## Service: [Service Name]

### Description
[What the service does]

### Dependencies
- [Dependency 1]
- [Dependency 2]

### Common Issues
1. [Issue]: [Solution]
2. [Issue]: [Solution]

### Monitoring
- Dashboard: [URL]
- Logs: [Location]
- Alerts: [Configuration]

### Contacts
- On-call: [Contact]
- Escalation: [Contact]
```

## Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Backup verified
- [ ] Security scan completed
- [ ] Performance benchmarked
- [ ] Rollback plan ready
- [ ] Team notified