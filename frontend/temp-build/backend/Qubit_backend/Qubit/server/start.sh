#!/bin/bash
set -e

# Create necessary directories
mkdir -p /tmp/.X11-unix
chmod 1777 /tmp/.X11-unix

# Clean up any existing X server locks
rm -f /tmp/.X0-lock /tmp/.X11-unix/X0

# Set display
export DISPLAY=:0

# Start Xvfb in the background
Xvfb :0 -screen 0 1280x800x24 -ac +extension GLX +render -noreset &
XVFB_PID=$!

# Start fluxbox
fluxbox -display :0 -screen 0 &

# Set up x11vnc with a password (change 'password' to your desired password)
mkdir -p ~/.vnc
x11vnc -storepasswd password ~/.vnc/passwd
x11vnc -display :0 -rfbport 5900 -rfbauth ~/.vnc/passwd -forever -shared -repeat -xkb -bg

# Start websockify for noVNC
websockify --web /usr/share/novnc 6080 localhost:5900 &

# Start Caddy in the background
caddy run --config /app/server/Caddyfile --adapter caddyfile &

# Start the FastAPI server
exec uvicorn server.main:app --host 0.0.0.0 --port 9000 --workers 1

# Keep the container running
wait $XVFB_PID
