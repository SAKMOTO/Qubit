FROM python:3.11-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Copy app code
COPY server/ /app/server/
COPY web/ /app/web/

# Install deps and Playwright Chromium with system dependencies
RUN pip install --upgrade pip \
    && pip install playwright==1.48.0 \
    && python -m playwright install chromium --with-deps \
    && pip install fastapi==0.115.0 'uvicorn[standard]' python-dotenv==1.0.1 browser-use

EXPOSE 8000

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
