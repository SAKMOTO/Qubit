from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import asyncio
import base64
import os
import uuid
from typing import Dict, Optional
from playwright.async_api import async_playwright
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Qubit Browser - Live View")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files BEFORE routes
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except Exception as e:
    print(f"Warning: Could not mount static files: {e}")

# Store active browser sessions
active_sessions: Dict[str, dict] = {}

class TaskRequest(BaseModel):
    task: str
    api_key: Optional[str] = None

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    try:
        with open("templates/index.html", "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Template not found</h1>", status_code=404)

@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "healthy", "active_sessions": len(active_sessions)}

@app.post("/start-session")
async def start_session(request: TaskRequest):
    """Start a new browser session with live view"""
    print(f"[START-SESSION] Received task: {request.task}")
    session_id = str(uuid.uuid4())
    
    active_sessions[session_id] = {
        "status": "initializing",
        "task": request.task,
        "viewer_url": None,
        "last_screenshot": None,
        "browser": None,
        "page": None,
        "agent": None,
        "websocket": None
    }
    
    print(f"[START-SESSION] Created session: {session_id}")
    return {
        "session_id": session_id,
        "status": "session_created",
        "message": "Session initialized. Connect via WebSocket to start."
    }

@app.get("/session-status/{session_id}")
async def get_session_status(session_id: str):
    """Get the status of a browser session"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    return {
        "session_id": session_id,
        "status": session["status"],
        "has_screenshot": session["last_screenshot"] is not None
    }

@app.post("/stop-session/{session_id}")
async def stop_session(session_id: str):
    """Stop and cleanup a browser session"""
    if session_id not in active_sessions:
        return {"status": "session_not_found"}
    
    session = active_sessions[session_id]
    
    try:
        # Close WebSocket if open
        if session.get("websocket"):
            await session["websocket"].close()
        
        # Close browser if open
        if session.get("browser"):
            await session["browser"].close()
        
        # Stop playwright
        if session.get("playwright"):
            await session["playwright"].stop()
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        # Remove session
        del active_sessions[session_id]
    
    return {"status": "session_ended", "session_id": session_id}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time browser updates"""
    print(f"[WEBSOCKET] Connection attempt for session: {session_id}")
    await websocket.accept()
    print(f"[WEBSOCKET] Connection accepted for session: {session_id}")
    
    if session_id not in active_sessions:
        print(f"[WEBSOCKET] Invalid session ID: {session_id}")
        await websocket.close(code=1008, reason="Invalid session ID")
        return
    
    session = active_sessions[session_id]
    session["websocket"] = websocket
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket connected successfully",
            "session_id": session_id
        })
        
        # Initialize Playwright and browser
        await websocket.send_json({
            "type": "status",
            "message": "Initializing browser..."
        })
        
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(
            headless=False,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = await context.new_page()
        
        # Store browser references
        session.update({
            "browser": browser,
            "context": context,
            "page": page,
            "playwright": playwright,
            "status": "ready"
        })
        
        await websocket.send_json({
            "type": "status",
            "message": "Browser initialized. Starting task..."
        })
        
        # Get the task
        task = session.get("task", "Navigate to google.com")
        
        await websocket.send_json({
            "type": "status",
            "message": f"Running task: {task}"
        })
        
        # Run the task - for now, just navigate and take screenshot
        # TODO: Integrate browser-use Agent when LLM is configured
        try:
            # Simple navigation for testing
            await page.goto("https://www.google.com")
            await page.wait_for_load_state("networkidle")
            
            # Get screenshot
            screenshot = await page.screenshot()
            screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')
            session["last_screenshot"] = screenshot_b64
            
            await websocket.send_json({
                "type": "result",
                "message": "Task completed successfully",
                "result": f"Navigated to Google",
                "screenshot": f"data:image/png;base64,{screenshot_b64}"
            })
            
            session["status"] = "completed"
            
        except Exception as e:
            await websocket.send_json({
                "type": "error",
                "message": f"Task execution error: {str(e)}"
            })
            session["status"] = "error"
        
        # Keep connection alive for manual commands
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "screenshot":
                # Send current screenshot
                screenshot = await page.screenshot()
                screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')
                await websocket.send_json({
                    "type": "screenshot",
                    "screenshot": f"data:image/png;base64,{screenshot_b64}"
                })
            
            elif message.get("type") == "command":
                # Execute custom command
                command = message.get("command", "")
                await websocket.send_json({
                    "type": "status",
                    "message": f"Executing: {command}"
                })
                # Add command execution logic here
                
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Error: {str(e)}"
            })
        except:
            pass
    finally:
        # Cleanup
        try:
            if session.get("browser"):
                await session["browser"].close()
            if session.get("playwright"):
                await session["playwright"].stop()
        except Exception as e:
            print(f"Cleanup error: {e}")
        
        if session_id in active_sessions:
            del active_sessions[session_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
