FROM python:3.11-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Copy app code
COPY server/ /app/server/
COPY web/ /app/web/
COPY server/start.sh /app/server/start.sh
COPY server/Caddyfile /app/server/Caddyfile

# Install system deps for headful browser + noVNC stack
RUN apt-get update && apt-get install -y --no-install-recommends \
      xvfb x11vnc fluxbox novnc websockify caddy \
      ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Python deps and Playwright browsers
RUN pip install --upgrade pip \
    && pip install playwright==1.48.0 \
    && python -m playwright install chromium --with-deps \
    && pip install fastapi==0.115.0 'uvicorn[standard]' python-dotenv==1.0.1 browser-use

# Startup scripts and proxy config
RUN chmod +x /app/server/start.sh || true

EXPOSE 8000

CMD ["/bin/bash", "/app/server/start.sh"]
