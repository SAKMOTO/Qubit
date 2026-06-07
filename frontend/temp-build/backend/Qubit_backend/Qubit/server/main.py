from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import uvicorn

app = FastAPI(title="Browser-Use Agent Server")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "Browser-Use Agent Server is running"}

# Mount static files
app.mount("/static", StaticFiles(directory="/app/web/static"), name="static")

# Serve the main page
@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    try:
        with open("/app/web/index.html", "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error loading frontend: {str(e)}"}
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
