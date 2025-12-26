# Next Steps - Production Deployment Guide

**Status**: All development complete ✅  
**Goal**: Deploy to production and launch

---

## 🎯 Immediate Next Steps (This Week)

### 1. **End-to-End Testing** (2-3 hours)
**Priority**: 🔴 Critical

Test all new features locally:

```bash
# Ensure services are running
docker compose up -d

# Test checklist:
```

- [ ] **CSV Import**
  - Download template: `curl http://localhost:8000/stats/csv-template`
  - Import a CSV file via the API or UI
  - Verify stats are saved correctly

- [ ] **PDF Export**
  - Generate a report for a game with stats
  - Download PDF: `GET /reports/{report_id}/pdf`
  - Verify PDF contains all report sections

- [ ] **Onboarding Flow**
  - Clear localStorage: `localStorage.removeItem('emg_onboarding_complete')`
  - Refresh dashboard
  - Complete onboarding wizard
  - Verify team and game are created

- [ ] **Settings Page**
  - Navigate to `/dashboard/settings`
  - Test data export (downloads JSON file)
  - Test account deletion flow (use test account!)

- [ ] **User Endpoints**
  - `GET /users/me` - Returns user info
  - `GET /users/me/data-export` - Returns JSON data
  - Verify authentication required

---

### 2. **Production Environment Setup** (4-6 hours)
**Priority**: 🔴 Critical

#### Option A: Deploy to Vercel + Fly.io (Recommended)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL=https://your-api-domain.com
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
# - CLERK_SECRET_KEY=sk_live_...
# - NEXT_PUBLIC_SENTRY_DSN=https://...
```

**Backend (Fly.io):**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
cd apps/api
fly launch --config fly.toml

# Set secrets
fly secrets set \
  DATABASE_URL="postgresql://..." \
  OPENAI_API_KEY="sk-..." \
  CLERK_SECRET_KEY="sk_live_..." \
  CLERK_PUBLISHABLE_KEY="pk_live_..." \
  SENTRY_DSN="https://..." \
  ENVIRONMENT="production" \
  FRONTEND_URL="https://your-frontend-domain.com"

# Create Postgres database
fly postgres create --name explain-my-game-db
fly postgres attach --app explain-my-game-api explain-my-game-db
```

#### Option B: Deploy with Docker Compose (Self-hosted)

1. **Setup SSL Certificates**
   ```bash
   # Use Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   
   # Copy certificates
   mkdir -p certs
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/
   ```

2. **Configure Production Environment**
   ```bash
   # Create production .env
   cp .env.example .env.prod
   
   # Edit .env.prod with production values
   # - Update DATABASE_URL
   # - Add production Clerk keys
   # - Add OpenAI API key
   # - Add Sentry DSN
   # - Set ENVIRONMENT=production
   ```

3. **Deploy**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

---

### 3. **Configure Monitoring & Error Tracking** (1 hour)
**Priority**: 🟡 Important

**Sentry Setup:**
1. Create account at https://sentry.io
2. Create new project (FastAPI + Next.js)
3. Get DSN from project settings
4. Add to production environment variables:
   - Backend: `SENTRY_DSN`
   - Frontend: `NEXT_PUBLIC_SENTRY_DSN`
5. Test error reporting by triggering a test error

**Health Checks:**
- Verify `/health` endpoint works in production
- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Configure alerts for API downtime

---

### 4. **Update CI/CD Pipeline** (2 hours)
**Priority**: 🟡 Important

Edit `.github/workflows/ci.yml`:

```yaml
# Replace placeholder deployment steps with actual commands:

deploy-staging:
  steps:
    - name: Deploy to Fly.io (Staging)
      run: |
        fly deploy --app explain-my-game-api-staging
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

deploy-production:
  steps:
    - name: Deploy to Vercel
      run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
    
    - name: Deploy to Fly.io (Production)
      run: |
        fly deploy --app explain-my-game-api
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Add GitHub Secrets:
- `FLY_API_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

### 5. **Database Migration Strategy** (1 hour)
**Priority**: 🟡 Important

Since we added no schema changes, no migrations are needed for initial deployment.

**For future migrations:**
```bash
# Generate migration
docker compose exec api alembic revision --autogenerate -m "description"

# Review migration file
# Apply migration
docker compose exec api alembic upgrade head

# For production (Fly.io):
fly ssh console -a explain-my-game-api
alembic upgrade head
```

---

### 6. **Documentation Updates** (2-3 hours)
**Priority**: 🟢 Nice to Have

Update documentation:

- [ ] **README.md**
  - Add new features to feature list
  - Update quick start guide
  - Add production deployment instructions

- [ ] **API Documentation**
  - Ensure Swagger docs are accurate (`/docs`)
  - Document new endpoints:
    - `/stats/csv-template`
    - `/games/{game_id}/stats/import-csv`
    - `/reports/{report_id}/pdf`
    - `/users/me`
    - `/users/me/data-export`
    - `/users/me` (DELETE)

- [ ] **User Guide** (Optional)
  - How to import CSV stats
  - How to export PDF reports
  - How to export user data
  - Account deletion process

---

## 📋 Pre-Launch Checklist

### Code & Testing
- [x] All features implemented
- [ ] End-to-end testing completed
- [ ] Edge cases tested (empty CSV, missing fields, etc.)
- [ ] Error handling verified
- [ ] Loading states tested

### Infrastructure
- [ ] Production environment configured
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Database backups configured
- [ ] Environment variables set
- [ ] Resource limits appropriate

### Monitoring & Logging
- [ ] Sentry configured and tested
- [ ] Health checks working
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up (optional)

### Security
- [ ] Production API keys secured
- [ ] CORS configured correctly
- [ ] Rate limiting appropriate for production
- [ ] Authentication working (Clerk)
- [ ] HTTPS enforced

### Documentation
- [ ] README updated
- [ ] API docs accurate
- [ ] Environment variables documented
- [ ] Deployment guide complete

---

## 🚀 Launch Day Steps

1. **Final Verification** (30 min)
   - Run full test suite
   - Verify all features in staging
   - Check monitoring dashboards

2. **Deploy to Production** (15 min)
   - Deploy backend
   - Deploy frontend
   - Verify health checks

3. **Smoke Tests** (15 min)
   - Create test account
   - Create team
   - Add game with stats
   - Generate report
   - Export PDF
   - Test CSV import

4. **Monitor** (First 24 hours)
   - Watch Sentry for errors
   - Monitor API response times
   - Check database performance
   - Review user feedback

---

## 🎯 Post-Launch (Week 1-2)

### Immediate
- Monitor error rates
- Review user onboarding completion rates
- Check CSV import success rates
- Verify PDF generation works for all report types

### Optimization
- Analyze PDF generation performance
- Optimize CSV parsing for large files
- Review Sentry errors and fix issues
- Gather user feedback on onboarding

### Iteration
- Fix any critical bugs found
- Improve error messages based on user feedback
- Refine onboarding flow if needed
- Add missing CSV column aliases based on real usage

---

## 📞 Support & Troubleshooting

### Common Issues

**CSV Import Fails:**
- Check column names match template
- Verify required fields (points_for, points_against) present
- Check file encoding (UTF-8)

**PDF Export Fails:**
- Verify report exists
- Check stats are present
- Review server logs for errors

**Onboarding Not Showing:**
- Clear localStorage: `localStorage.removeItem('emg_onboarding_complete')`
- Check browser console for errors

**Sentry Not Working:**
- Verify DSN is correct
- Check environment variable is set
- Review Sentry dashboard for events

---

## 🎉 Success Criteria

**Ready to launch when:**
- ✅ All tests pass
- ✅ Production environment configured
- ✅ Monitoring active
- ✅ Documentation complete
- ✅ Security reviewed
- ✅ Backup strategy in place

**Launch successful when:**
- ✅ Zero critical errors in first 24 hours
- ✅ All features accessible to users
- ✅ Performance metrics acceptable
- ✅ User onboarding completes successfully

---

## Need Help?

- Review `COMPREHENSIVE_CHANGES_SUMMARY.md` for detailed feature documentation
- Check `QUICK_SUMMARY.md` for executive overview
- Review code comments in new files for implementation details
- Check API docs at `/docs` endpoint for endpoint specifications

