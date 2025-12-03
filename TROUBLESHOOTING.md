# 🔧 Troubleshooting Guide

## Issue 1: OpenHands Docker Error

**Error**: `❌ Docker daemon is not running.`

### Solution:
1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start (look for Docker icon in menu bar)
   - Then click "Launch OpenHands" again

2. **Verify Docker is Running**
   ```bash
   docker ps
   ```
   Should show list (even if empty) - not an error

## Issue 2: Terminal Not Showing Output

**Problem**: Can't see terminal output or chat input is disabled

### Check:
1. **Terminal Panel is Visible**
   - You should see two panels side by side
   - Left: Qubit Browser terminal
   - Right: OpenHands terminal with chat input at bottom

2. **Output is Streaming**
   - When you click "Launch OpenHands", output should appear immediately
   - If not, check browser console (Cmd+Option+I)

3. **Chat Input is Enabled**
   - Only enabled when OpenHands is running (green dot)
   - If disabled, OpenHands process exited - check terminal for error

## Issue 3: Can't Type Messages

**Problem**: Chat input is disabled or not visible

### Fix:
1. **Make sure OpenHands is running**
   - Green status indicator should be ON
   - Button should say "Running..."

2. **If process exited**
   - Check terminal output for error
   - Usually Docker error - start Docker Desktop
   - Then click "Launch OpenHands" again

3. **Input Field Location**
   - Bottom of OpenHands panel (right side)
   - Should be visible with "Type message..." placeholder

## Quick Fixes

### Restart App
1. Stop all processes (click Stop buttons)
2. Close and restart the Electron app
3. Try launching again

### Check Docker
```bash
docker ps
docker version
```

### Manual Test
Try running OpenHands in terminal:
```bash
uvx --python 3.12 openhands serve
```

If this works, Docker is fine - issue is in Electron.
If this fails, Docker issue - start Docker Desktop.

## UI Layout

```
┌─────────────────────────────────────────┐
│ Header with Launch/Stop buttons         │
├──────────────────┬──────────────────────┤
│ Qubit Terminal   │ OpenHands Terminal   │
│ (scrollable)     │ (scrollable)        │
│                  │                      │
│                  │ [Chat Input] [Send] │
└──────────────────┴──────────────────────┘
```

## Still Having Issues?

1. Check terminal output in Electron DevTools (View → Developer → Toggle Developer Tools)
2. Check system terminal where you ran `npm start` for errors
3. Verify Docker Desktop is running
4. Try restarting Docker Desktop
5. Check if ports 3000 and 8000 are available





