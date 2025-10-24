from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
from pathlib import Path
import os

from .runner import start_job, stream_logs, job_status

app = FastAPI(title="BrowserUse Agent Server")

# CORS: adjust in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    api_key: str
    task: str


@app.post("/run")
async def run(req: RunRequest) -> Dict[str, str]:
    api_key = (req.api_key or "").strip()
    task = (req.task or "").strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key is required")
    if not task:
        raise HTTPException(status_code=400, detail="task is required")
    job_id = start_job(api_key=api_key, task=task)
    return {"job_id": job_id}


@app.get("/logs/{job_id}")
async def logs(job_id: str):
    async def event_source():
        async for chunk in stream_logs(job_id):
            yield chunk
    return StreamingResponse(event_source(), media_type="text/event-stream")


@app.get("/status/{job_id}")
async def status(job_id: str):
    return job_status(job_id)


# Serve frontend (index.html) if present.
# Mount / as static to serve web assets; fallback to index.html.
# Resolve the web directory relative to this file so it works locally and in Docker
WEB_DIR = (Path(__file__).resolve().parent.parent / "web")
app.mount("/static", StaticFiles(directory=str(WEB_DIR)), name="static")


@app.get("/")
async def root():
    return FileResponse(str(WEB_DIR / "index.html"))
