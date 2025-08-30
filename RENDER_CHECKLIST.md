# ✅ Render Deployment Checklist

## Pre-Deployment
- [x] Professional admin dashboard implemented
- [x] Mobile-optimized UI completed
- [x] Database migration scripts created
- [x] Health check endpoint added
- [x] Vercel-specific files removed
- [x] Package.json updated for Render
- [x] Render configuration files created
- [x] Deployment documentation written

## GitHub Setup
- [ ] Push code to GitHub repository
  ```bash
  git push origin staging:main
  ```

## Render Account Setup
- [ ] Create Render account at https://render.com
- [ ] Connect GitHub account
- [ ] Authorize repository access

## Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Note database connection URL
- [ ] Run migration script

## Web Service Setup
- [ ] Create web service on Render
- [ ] Connect to GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables

## Environment Variables to Set
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your Render app URL

## Data Migration
- [ ] Export data from Supabase
- [ ] Import data to Render PostgreSQL
- [ ] Verify data integrity

## Testing
- [ ] Health check endpoint responding
- [ ] User login working
- [ ] Booking creation working
- [ ] Admin panel accessible
- [ ] Mobile UI functioning

## Post-Deployment
- [ ] Set up monitoring alerts
- [ ] Enable auto-deploy
- [ ] Configure custom domain (optional)
- [ ] Set up database backups
- [ ] Document admin credentials

## Verification URLs
- [ ] Main app: https://[your-app].onrender.com
- [ ] Health: https://[your-app].onrender.com/api/health
- [ ] Admin: https://[your-app].onrender.com/admin

## Emergency Contacts
- Render Support: support@render.com
- Render Status: https://status.render.com
- Documentation: https://render.com/docs

---

**Ready to Deploy?** Follow DEPLOYMENT_STEPS.md for detailed instructions!