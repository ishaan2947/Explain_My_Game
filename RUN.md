# How to Run the Project

## Quick Start (One Command)

```bash
docker compose up --build
```

**That's it!** This will:
- ✅ Build all Docker images
- ✅ Start PostgreSQL database (pgvector enabled)
- ✅ Run database migrations automatically
- ✅ Seed database with demo data
- ✅ Start FastAPI backend on port 8000
- ✅ Start Next.js frontend on port 3000

---

## Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Main application |
| **Dashboard** | http://localhost:3000/dashboard | Team & game management |
| **API Docs** | http://localhost:8000/docs | Swagger API documentation |
| **API Health** | http://localhost:8000/health | Health check endpoint |

---

## Test the Application

### 1. Web Interface

1. Open http://localhost:3000
2. Click "Get Started" or go to Dashboard
3. You'll see demo teams already created
4. Click on a team to view games
5. Click on a game to see stats and AI reports

### 2. API Endpoints (using curl/PowerShell)

```bash
# Health check
curl http://localhost:8000/health

# Get teams (with dev auth)
curl -H "Authorization: Bearer dev_user_seed_001" http://localhost:8000/teams

# API documentation
open http://localhost:8000/docs
```

---

## Environment Variables (Optional)

The app works without any configuration in development mode!

### For OpenAI Reports (apps/api/.env)

```env
OPENAI_API_KEY=sk-your-key-here
```

### For Clerk Authentication (apps/web/.env.local)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### For Clerk Backend (apps/api/.env)

```env
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Commands

### Start
```bash
docker compose up --build
```

### Start (background)
```bash
docker compose up -d --build
```

### Stop
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Just API
docker compose logs -f api

# Just Web
docker compose logs -f web
```

### Fresh Start (wipe everything)
```bash
docker compose down -v
docker compose up --build
```

---

## Troubleshooting

### Port Already in Use

**Windows:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :8000
kill -9 <PID>
```

### Docker Desktop Not Running

Make sure Docker Desktop is started before running docker compose.

### Database Issues

```bash
# Reset everything
docker compose down -v
docker compose up --build
```

---

## What's Working

- ✅ Landing page with beautiful UI
- ✅ Dashboard with team/game overview
- ✅ Create/edit/delete teams
- ✅ Create/edit/delete games
- ✅ Basketball stats entry
- ✅ AI-powered game reports (requires OpenAI key)
- ✅ Dev mode authentication (no setup required)
- ✅ Full authentication with Clerk (optional)

---

## See Also

- `README.md` - Project overview
- `PRODUCTION_READY.md` - Full status report
- `QUICKSTART.md` - Quick start guide
- `TROUBLESHOOTING.md` - Common issues
