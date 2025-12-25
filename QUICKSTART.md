# Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- (Optional) OpenAI API key for report generation
- (Optional) Clerk account for authentication

## Minimal Setup (Just to Get Running)

You can run the project with minimal configuration:

```bash
# 1. Navigate to project root
cd Explain_My_Game

# 2. Build and start all services
docker compose up --build
```

This will:
- Start PostgreSQL database (with pgvector extension)
- Start the FastAPI backend (runs migrations automatically)
- Start the Next.js frontend
- Seed the database with demo data (1 user, 1 team, 1 game)

**Note**: Without Clerk/OpenAI keys, some features won't work, but the basic API and web app will run.

## Verify It's Working

### 1. Check API Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Check API Docs
Open in browser: http://localhost:8000/docs

### 3. Check Web App
Open in browser: http://localhost:3000

### 4. Test Authentication (Dev Mode)
```bash
# Using the seeded user
curl -H "Authorization: Bearer dev_user_seed_001" \
  http://localhost:8000/health
```

## Full Setup (With All Features)

### Step 1: Create Environment Files

```bash
# Backend
cp apps/api/env.example apps/api/.env

# Frontend (optional for now)
cp apps/web/env.local.example apps/web/.env.local
```

### Step 2: Configure Environment Variables

Edit `apps/api/.env`:

```env
# Database (already handled by docker-compose, but good to have)
DATABASE_URL=postgresql://emg_user:emg_password@postgres:5432/explain_my_game

# OpenAI (required for report generation in Phase 4)
OPENAI_API_KEY=sk-your-actual-openai-key

# Clerk Auth (required for production auth)
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Step 3: Start Services

```bash
docker compose up --build
```

## Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes (Fresh Start)
```bash
docker compose down -v
```

### Run Database Migrations Manually
```bash
docker compose exec api alembic upgrade head
```

### Seed Database Manually
```bash
docker compose exec api python -m src.scripts.seed
```

### Access Database
```bash
docker compose exec postgres psql -U emg_user -d explain_my_game
```

### Restart a Specific Service
```bash
docker compose restart api
docker compose restart web
```

## Troubleshooting

### Port Already in Use

If port 3000, 8000, or 5432 is already in use:

```bash
# Stop conflicting services or change ports in docker-compose.yml
docker compose down
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### API Not Starting

```bash
# Check API logs
docker compose logs api

# Check if migrations ran
docker compose exec api alembic current

# Manually run migrations
docker compose exec api alembic upgrade head
```

### Frontend Build Issues

```bash
# Rebuild frontend
docker compose build web --no-cache
docker compose up web
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker compose down -v

# Remove all containers and images
docker system prune -a

# Rebuild from scratch
docker compose up --build
```

## What's Running

After `docker compose up --build`, you have:

| Service | URL | Purpose |
|---------|-----|---------|
| PostgreSQL | `localhost:5432` | Database |
| FastAPI | `http://localhost:8000` | Backend API |
| API Docs | `http://localhost:8000/docs` | Swagger UI |
| Next.js | `http://localhost:3000` | Frontend |

## Development Mode

The services are configured for development:
- API: Hot reload enabled (code changes reflected immediately)
- Web: Next.js dev server (code changes reflected immediately)
- Database: Persists data in Docker volume

## Next Steps

Once everything is running:
1. ✅ Phase 0: Infrastructure - DONE
2. ✅ Phase 1: Database models - DONE  
3. ✅ Phase 2: Auth & RBAC - DONE
4. ⏭️ Phase 3: CRUD endpoints (coming next)
5. ⏭️ Phase 4: LLM report generation
6. ⏭️ Phase 5: Frontend pages
7. ⏭️ Phase 6: Tests & polish

