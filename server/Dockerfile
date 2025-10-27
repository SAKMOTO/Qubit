FROM python:3.11-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    DISPLAY=:0 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    x11vnc \
    fluxbox \
    novnc \
    websockify \
    caddy \
    imagemagick \
    x11-apps \
    procps \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    python -m playwright install chromium --with-deps

# Copy application code
COPY . .

# Set up noVNC
RUN mkdir -p /usr/share/novnc/utils/websockify && \
    ln -s /usr/share/novnc/vnc.html /usr/share/novnc/index.html

# Make scripts executable
RUN chmod +x /app/server/start.sh

# Expose ports
EXPOSE 8000 5900 5901 6080

# Set the working directory
WORKDIR /app/server

# Start the application
CMD ["/bin/bash", "/app/server/start.sh"]
