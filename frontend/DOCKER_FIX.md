# Docker Error Fix

## Issue
OpenHands requires Docker to be running. If you see:
```
❌ Docker daemon is not running.
Please start Docker and try again.
```

## Solution

### Option 1: Start Docker Desktop
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Try launching OpenHands again

### Option 2: Run OpenHands Without Docker
The app now tries to use `--no-docker` flag, but if that doesn't work:

1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Then launch OpenHands

### Option 3: Use OpenHands CLI Directly
You can run OpenHands manually in terminal:
```bash
uvx --python 3.12 openhands serve
```

## Checking Docker Status

In terminal:
```bash
docker ps
```

If Docker is running, you'll see container list (or empty list).
If not running, you'll see an error - then start Docker Desktop.





