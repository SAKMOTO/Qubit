from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import asyncio
import base64
import os
from typing import Dict, Optional
from browser_use import Agent
from playwright.async_api import async_playwright
import json

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active browser sessions
active_sessions: Dict[str, dict] = {}

class TaskRequest(BaseModel):
    task: str
    session_id: Optional[str] = None

@app.get("/")
async def read_root():
    return {"message": "Browser-Use Live Agent is running"}

@app.post("/start-session")
async def start_session():
    """Start a new browser session"""
    session_id = str(len(active_sessions) + 1)
    active_sessions[session_id] = {
        "status": "initializing",
        "last_screenshot": None,
        "browser": None,
        "page": None,
        "agent": None
    }
    return {"session_id": session_id, "status": "session_created"}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    if session_id not in active_sessions:
        await websocket.close(code=1000, reason="Invalid session ID")
        return
    
    session = active_sessions[session_id]
    
    try:
        # Initialize Playwright and browser if not already done
        if not session["browser"]:
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch(headless=False)
            context = await browser.new_context()
            page = await context.new_page()
            
            # Store browser and page references
            session.update({
                "browser": browser,
                "context": context,
                "page": page,
                "playwright": playwright,
                "status": "ready"
            })
            
            # Initialize the agent
            session["agent"] = Agent()
        
        # Main WebSocket loop
        while True:
            # Wait for a message from the client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "command":
                # Execute the command using the agent
                result = await session["agent"].run(message["command"])
                
                # Get the current page screenshot
                screenshot = await session["page"].screenshot()
                screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')
                
                # Send the result and screenshot back to the client
                await websocket.send_json({
                    "type": "result",
                    "result": str(result),
                    "screenshot": f"data:image/png;base64,{screenshot_b64}"
                })
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
    finally:
        # Clean up
        if session.get("browser"):
            await session["browser"].close()
        if session.get("playwright"):
            await session["playwright"].stop()
        if session_id in active_sessions:
            del active_sessions[session_id]

# Mount the static files (for the frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
