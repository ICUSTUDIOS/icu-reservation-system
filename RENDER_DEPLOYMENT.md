# 🚀 Render Deployment Guide for ICU Reservation System

## Overview
This guide walks you through migrating the ICU Reservation System from Vercel/Supabase to Render with PostgreSQL.

## Prerequisites
- Render account (https://render.com)
- GitHub repository with the project code
- Current Supabase credentials for data migration

## 📋 Deployment Steps

### 1. Prepare Your Repository
```bash
# Commit all changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Account & Connect GitHub
1. Sign up at https://render.com
2. Connect your GitHub account
3. Authorize access to your repository

### 3. Deploy Using Blueprint (Recommended)
1. Click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will detect `render.yaml` automatically
4. Review the configuration
5. Click "Apply" to create all services

### 4. Configure Environment Variables
Navigate to each service's dashboard and set:

#### Web Service Environment Variables
```bash
# Required - Database will auto-populate DATABASE_URL
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com

# Authentication (generate secure values)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Supabase (during migration)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-key>
```

### 5. Initialize Database
1. Go to your database service in Render Dashboard
2. Click "Connect" → "External Connection"
3. Copy the external database URL
4. Run migration:

```bash
# Using psql
psql <DATABASE_URL> < scripts/render-migration.sql

# Or using Render's web shell
cat scripts/render-migration.sql | psql $DATABASE_URL
```

### 6. Migrate Data from Supabase

#### Export from Supabase
```bash
# Connect to Supabase
pg_dump <SUPABASE_DATABASE_URL> \
  --data-only \
  --table=members \
  --table=bookings \
  --table=applications \
  --table=point_ledger \
  --table=reports \
  > supabase-data.sql
```

#### Import to Render
```bash
# Import data
psql <RENDER_DATABASE_URL> < supabase-data.sql
```

### 7. Update Application Code

#### Update Database Connection
Create `lib/db.ts`:
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default pool
```

#### Update Authentication
Replace Supabase Auth with NextAuth or similar:
```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      // Implementation
    })
  ],
  // Configuration
}
```

### 8. Test Deployment
1. Check health endpoint: `https://your-app.onrender.com/api/health`
2. Test login functionality
3. Verify booking system works
4. Check admin panel access
5. Test mobile responsiveness

## 📊 Monitoring & Maintenance

### Health Checks
- Render automatically monitors `/api/health`
- Set up alerts for failures
- Monitor response times

### Database Backups
1. Enable automatic backups in Render Dashboard
2. Set retention period (recommended: 7 days)
3. Test restore procedure monthly

### Logs
- Access logs via Render Dashboard
- Set up log drain for external monitoring
- Configure alerts for errors

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. Render auto-deploys from main branch by default
2. Configure branch deploys for staging:
   ```yaml
   # In render.yaml
   autoDeploy: true
   branch: main  # or staging
   ```

### Deploy Hooks
Add to `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/post-build.js",
    "start": "next start -p $PORT"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
# Ensure all dependencies are in package.json
npm ci
npm run build
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL settings
# Add ?sslmode=require to DATABASE_URL if needed
```

#### Memory Issues
- Upgrade to Standard plan for more memory
- Optimize Next.js build:
  ```javascript
  // next.config.mjs
  module.exports = {
    experimental: {
      workerThreads: false,
      cpus: 1
    }
  }
  ```

### Performance Optimization

#### Enable Caching
```javascript
// Add to next.config.mjs
module.exports = {
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
```

#### Database Optimization
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_bookings_date_range 
ON bookings(start_time, end_time) 
WHERE status = 'confirmed';

-- Analyze tables
ANALYZE members;
ANALYZE bookings;
```

## 📝 Migration Checklist

- [ ] Repository prepared and pushed
- [ ] Render account created
- [ ] Services deployed via Blueprint
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Data migrated from Supabase
- [ ] Health check passing
- [ ] Authentication working
- [ ] Booking system functional
- [ ] Admin panel accessible
- [ ] Mobile experience tested
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Team access granted
- [ ] Documentation updated

## 🔐 Security Considerations

1. **Secrets Management**
   - Use Render's secret files for sensitive data
   - Rotate secrets quarterly
   - Never commit secrets to Git

2. **Database Security**
   - Use connection pooling
   - Implement rate limiting
   - Regular security updates

3. **Application Security**
   - Enable HTTPS (automatic on Render)
   - Set security headers
   - Regular dependency updates

## 📞 Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

### Application Issues
- Check logs in Render Dashboard
- Review this documentation
- Test locally first

## 🎉 Post-Deployment

1. **Update DNS** (if using custom domain)
   - Add CNAME record pointing to Render URL
   - Configure SSL certificate

2. **Monitor Performance**
   - Set up uptime monitoring
   - Configure error tracking (Sentry)
   - Monitor database performance

3. **Team Training**
   - Share Render Dashboard access
   - Document deployment process
   - Create runbook for common issues

---

## Success! 🎊

Your ICU Reservation System is now deployed on Render with:
- ✅ Professional admin dashboard
- ✅ Mobile-optimized UI
- ✅ PostgreSQL database
- ✅ Automatic deployments
- ✅ Health monitoring
- ✅ Scalable infrastructure

**Next Steps:**
1. Monitor the application for 24 hours
2. Gather user feedback
3. Plan feature enhancements
4. Schedule regular maintenance

---

*Last Updated: December 2024*
*Version: 1.0.0*