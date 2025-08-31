# ICU Platform - Scaling Roadmap & Migration Strategy

## Vision
Transform from a single-venue reservation system to a multi-tenant SaaS platform for hourly space rentals (Airbnb for hourly bookings).

## Current Architecture (Phase 1: MVP)
- **Frontend**: Next.js on Vercel
- **Database**: Supabase (PostgreSQL + Auth)
- **Users**: 50-200
- **Venues**: 1 (ICU Studio)

## Scaling Roadmap

### Phase 2: Multi-Venue (Months 4-6)
**Goal**: Support 5-10 venues with basic customization

#### Features to Add:
- [ ] Venue onboarding flow
- [ ] Custom subdomain per venue (venue.icu-platform.com)
- [ ] Basic white-labeling (logo, colors)
- [ ] Venue admin dashboard
- [ ] Multi-currency support

#### Tech Stack Evolution:
```
Frontend: Vercel (Next.js with dynamic routing)
Database: Supabase (add venue_id to all tables)
Auth: Supabase Auth with organizations
Storage: Supabase Storage for venue assets
```

#### Key Migrations:
1. Add `venue_id` to all tables
2. Implement RLS policies per venue
3. Create venue settings table
4. Add subdomain routing

### Phase 3: Platform Growth (Months 7-12)
**Goal**: 50+ venues, 5,000 users, payment processing

#### Features to Add:
- [ ] Stripe Connect for payment splitting
- [ ] Advanced analytics per venue
- [ ] Email/SMS notifications (Twilio/SendGrid)
- [ ] Mobile app (React Native)
- [ ] Automated invoicing
- [ ] Review system

#### Tech Stack Evolution:
```
Frontend: Vercel (Next.js)
API Gateway: Vercel Edge Functions
Heavy Processing: Render/Railway (Node.js)
Database: Supabase (consider connection pooling)
Queue: Redis + Bull (on Render)
Payments: Stripe Connect
Notifications: SendGrid + Twilio
```

#### Key Migrations:
1. Extract heavy operations to separate API
2. Implement job queue for async tasks
3. Add Redis caching layer
4. Set up Stripe Connect

### Phase 4: Scale (Year 2+)
**Goal**: 500+ venues, 50,000+ users, marketplace

#### Features to Add:
- [ ] AI-powered scheduling optimization
- [ ] Marketplace for services
- [ ] Advanced reporting & BI
- [ ] API for third-party integrations
- [ ] Global search across venues
- [ ] Dynamic pricing

#### Tech Stack Evolution:
```
Frontend: Cloudflare Pages (better global CDN)
API: AWS ECS or Kubernetes
Database: AWS RDS or PlanetScale
Cache: Redis Cluster
Queue: AWS SQS + Lambda
Search: Elasticsearch
Analytics: ClickHouse
Storage: S3 + CloudFront
```

## Migration Triggers

### When to Start Phase 2:
- First paying venue customer
- OR 500+ monthly active users
- OR Need for customization

### When to Start Phase 3:
- 10+ venues onboarded
- OR Processing $10k+/month
- OR Performance issues on Vercel

### When to Start Phase 4:
- 100+ venues
- OR $100k+/month revenue
- OR International expansion

## Database Migration Strategy

### Current (Single-tenant):
```sql
-- Simple structure
bookings
members
booking_slots
```

### Phase 2 (Multi-tenant):
```sql
-- Add venue layer
venues (id, name, subdomain, settings)
bookings (id, venue_id, member_id, ...)
members (id, venue_id, ...)
venue_settings (venue_id, key, value)
```

### Phase 3+ (Scaled):
```sql
-- Separate by concern
venues_db: venues, settings, customization
bookings_db: bookings, availability
users_db: users, auth, permissions
analytics_db: events, metrics
```

## Cost Projections

| Phase | Monthly Cost | Per Venue | Stack |
|-------|-------------|-----------|-------|
| Phase 1 | $0-20 | N/A | Vercel Free + Supabase Free |
| Phase 2 | $50-100 | $10 | Vercel Pro + Supabase Pro |
| Phase 3 | $500-1000 | $10-20 | Vercel + Render + Supabase |
| Phase 4 | $2000+ | $4-10 | AWS/GCP full stack |

## Risk Mitigation

### Technical Risks:
1. **Database connection limits**: Use PgBouncer by Phase 3
2. **Vercel timeouts**: Move heavy ops to Render early
3. **Storage costs**: Implement S3 + lifecycle policies
4. **Real-time costs**: Consider custom WebSocket server

### Business Risks:
1. **Vendor lock-in**: Keep database portable (PostgreSQL)
2. **Scaling costs**: Monitor usage, optimize early
3. **Security**: Implement SOC2 by Phase 3
4. **Compliance**: GDPR/CCPA ready by Phase 2

## Action Items for Current Phase

### Immediate (This Month):
1. [ ] Add venue_id field to all tables (dormant)
2. [ ] Create feature flags system
3. [ ] Set up proper logging (Sentry/LogRocket)
4. [ ] Implement rate limiting
5. [ ] Add API versioning

### Next Quarter:
1. [ ] Build venue onboarding flow
2. [ ] Implement subdomain routing
3. [ ] Create admin super-dashboard
4. [ ] Add Stripe integration
5. [ ] Build notification system

## Decision Points

### Stay on Vercel if:
- Less than 50 venues
- Simple customization needs
- No complex background jobs
- Under 10k daily users

### Migrate to Hybrid if:
- Need background job processing
- Complex reporting requirements
- Multi-region requirements
- Custom infrastructure needs

## Monitoring KPIs

Track these to know when to scale:

1. **Performance**:
   - API response time > 500ms
   - Database query time > 100ms
   - Page load time > 3s

2. **Business**:
   - Venues onboarded
   - Monthly recurring revenue
   - User growth rate

3. **Technical**:
   - Database connections used
   - Vercel function invocations
   - Storage usage

## Conclusion

Start simple with Vercel + Supabase, but architect for multi-tenancy from day one. The key is making incremental changes that don't require full rewrites.

**Remember**: It's better to have scaling problems than no users!