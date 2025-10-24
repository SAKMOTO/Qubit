#!/usr/bin/env bash
set -euo pipefail

# Env setup
export DISPLAY=:0
export PYTHONUNBUFFERED=1

# Start X virtual framebuffer (screen 1280x800x24)
Xvfb :0 -screen 0 1280x800x24 -nolisten tcp &
XVFB_PID=$!

# Start lightweight window manager
fluxbox >/dev/null 2>&1 &

# Start VNC server bound to Xvfb display (localhost only)
x11vnc -display :0 -nopw -shared -forever -rfbport 5900 -localhost >/dev/null 2>&1 &

# Start websockify to expose VNC over WebSocket
websockify --web=/usr/share/novnc 127.0.0.1:5901 127.0.0.1:5900 >/dev/null 2>&1 &

# Start the FastAPI app (Uvicorn) on 9000, Caddy will proxy it on 8000
uvicorn server.main:app --host 127.0.0.1 --port 9000 &

# Start Caddy reverse proxy to multiplex single public port
caddy run --config /app/server/Caddyfile --adapter caddyfile
