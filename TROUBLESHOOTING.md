# Troubleshooting Guide

## Docker Desktop Not Running

### Error:
```
unable to get image 'explain_my_game-api': error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/..."
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### Solution:
1. **Start Docker Desktop**:
   - Open Docker Desktop from the Start menu or system tray
   - Wait for Docker Desktop to fully start (whale icon should be steady, not animating)
   - You should see "Docker Desktop is running" in the system tray

2. **Verify Docker is running**:
   ```powershell
   docker ps
   ```
   - If this works, Docker is running
   - If you get an error, Docker is not ready yet

3. **Then try again**:
   ```powershell
   docker compose up --build
   ```

## Common Issues on Windows

### Issue: Docker Desktop Won't Start

**Possible causes:**
- WSL 2 not enabled
- Hyper-V conflicts
- Virtualization not enabled in BIOS

**Solution:**
1. Ensure WSL 2 is installed:
   ```powershell
   wsl --install
   ```
2. Restart your computer
3. Start Docker Desktop again

### Issue: Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

Or change the port in `docker-compose.yml`.

### Issue: Permission Denied on Windows

**Solution:**
- Run PowerShell as Administrator
- Or ensure Docker Desktop has proper permissions

### Issue: Slow Performance on Windows

**Solutions:**
1. Ensure Docker Desktop is using WSL 2 backend (Settings > General > Use WSL 2)
2. Allocate more resources to Docker (Settings > Resources)
3. Exclude project folder from antivirus scanning

## Verify Docker Installation

Run these commands to check everything:

```powershell
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Check if Docker daemon is running
docker ps

# Check Docker Desktop status
docker info
```

All commands should work without errors if Docker is properly installed and running.

