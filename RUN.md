# How to Run the Project

## Simple Start (Just Get It Running)

**One command to run everything:**

```bash
docker compose up --build
```

That's it! This will:
- ✅ Pull/build all Docker images
- ✅ Start PostgreSQL database
- ✅ Run database migrations automatically
- ✅ Seed database with demo data
- ✅ Start FastAPI backend on port 8000
- ✅ Start Next.js frontend on port 3000

## Verify It Works

Open these URLs in your browser:

1. **API Health Check**: http://localhost:8000/health
   - Should return: `{"status": "healthy", "environment": "development", "version": "1.0.0"}`

2. **API Documentation**: http://localhost:8000/docs
   - Swagger UI with all available endpoints

3. **Web Application**: http://localhost:3000
   - Landing page should load

## Test Authentication (Dev Mode)

Since you're in development mode, you can test authentication without Clerk:

```bash
# Use the seeded user
curl -H "Authorization: Bearer dev_user_seed_001" \
  http://localhost:8000/health
```

## Stop the Services

Press `Ctrl+C` in the terminal, or in another terminal:

```bash
docker compose down
```

## View Logs

```bash
# All services
docker compose logs -f

# Just the API
docker compose logs -f api

# Just the web app
docker compose logs -f web

# Just the database
docker compose logs -f postgres
```

## Common Issues

### Port Already in Use

If you get errors about ports being in use:

**Windows:**
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

Or just stop Docker Desktop and restart it.

### Database Connection Errors

If you see database connection errors:

```bash
# Check if postgres container is running
docker compose ps

# Restart everything
docker compose down
docker compose up --build
```

### API Not Starting

Check the logs:

```bash
docker compose logs api
```

Look for errors. Common issues:
- Missing dependencies (should be resolved by requirements.txt)
- Migration errors (should auto-run, but you can manually run: `docker compose exec api alembic upgrade head`)

## What You Need to Know

1. **First run takes time**: Building Docker images and installing dependencies takes 2-5 minutes

2. **Environment variables**: The docker-compose.yml has defaults, so you don't need .env files to start. For full features (Phase 4+), you'll need OpenAI and Clerk keys.

3. **Data persists**: The database data is stored in a Docker volume, so it persists even when you stop containers.

4. **Fresh start**: To wipe everything and start over:
   ```bash
   docker compose down -v  # Removes volumes too
   docker compose up --build
   ```

## Next Steps After Running

Once everything is up:

1. ✅ Check http://localhost:8000/health - should be healthy
2. ✅ Check http://localhost:8000/docs - API documentation
3. ✅ Check http://localhost:3000 - Web app landing page
4. ⏭️ Phase 3 (CRUD endpoints) will add actual API routes
5. ⏭️ Phase 4 (LLM reports) will require OpenAI API key
6. ⏭️ Phase 5 (Frontend) will add all the pages

For more details, see `README.md` or `QUICKSTART.md`.

