"""
Qubit Backend - FastAPI Server
Main API endpoint that integrates Qubit + OpenHands
This is a wrapper that combines both services.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import Optional, Dict, Any
import uvicorn
import sys
import os

# Add Qubit to path
qubit_path = os.path.join(os.path.dirname(__file__), "Qubit")
if qubit_path not in sys.path:
    sys.path.insert(0, qubit_path)

# Try to import Qubit's FastAPI app if available
QUBIT_AVAILABLE = False
qubit_app = None

try:
    # Try importing from Qubit folder
    sys.path.insert(0, qubit_path)
    from main import app as qubit_app
    QUBIT_AVAILABLE = True
    print("✅ Qubit FastAPI app loaded from Qubit/main.py")
except ImportError as e:
    print(f"⚠️  Could not import Qubit app: {e}")
    print("   Using wrapper only. Qubit features will be limited.")

app = FastAPI(title="Qubit AI Backend - Integrated", version="1.0.0")

# Enable CORS for Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenHands API endpoint
OPENHANDS_URL = "http://127.0.0.1:3000"

# Mount Qubit app if available (this routes /qubit/* to Qubit's app)
if QUBIT_AVAILABLE and qubit_app:
    try:
        app.mount("/qubit", qubit_app)
        print("✅ Qubit app mounted at /qubit")
    except Exception as e:
        print(f"⚠️  Could not mount Qubit app: {e}")

class CommandRequest(BaseModel):
    command: str
    parameters: Optional[Dict[str, Any]] = None

class OpenHandsRequest(BaseModel):
    command: str
    data: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Qubit AI Backend - Integrated",
        "qubit_available": QUBIT_AVAILABLE,
        "qubit_endpoints": [
            "http://127.0.0.1:8000/",
            "http://127.0.0.1:8000/qubit/",
            "http://127.0.0.1:8000/docs",
        ] if QUBIT_AVAILABLE else [],
        "openhands_url": OPENHANDS_URL,
        "endpoints": {
            "health": "/health",
            "execute": "/execute",
            "integration_status": "/api/integration/status"
        }
    }

@app.get("/health")
async def health():
    """Health check with OpenHands status."""
    try:
        response = requests.get(f"{OPENHANDS_URL}/api/health", timeout=2)
        openhands_status = "online" if response.status_code == 200 else "offline"
    except:
        openhands_status = "offline"
    
    return {
        "qubit": "online",
        "openhands": openhands_status
    }

@app.post("/execute")
async def execute_command(request: CommandRequest):
    """
    Execute a command through OpenHands.
    
    Example:
        POST /execute
        {
            "command": "python_script",
            "parameters": {"script": "print('Hello World')"}
        }
    """
    try:
        # Forward command to OpenHands
        openhands_payload = {
            "command": request.command,
            "data": request.parameters or {}
        }
        
        response = requests.post(
            f"{OPENHANDS_URL}/api/command",
            json=openhands_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            return {
                "success": True,
                "result": response.json(),
                "source": "openhands"
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenHands returned error: {response.text}"
            )
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="OpenHands server is not available. Make sure it's running on port 3000."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing command: {str(e)}"
        )

@app.post("/qubit/process")
async def qubit_process(data: Dict[str, Any]):
    """
    Process data through Qubit AI backend.
    This is where you'd integrate your Qubit-specific logic.
    """
    # TODO: Add your Qubit-specific processing logic here
    return {
        "success": True,
        "processed_data": data,
        "message": "Qubit processing (placeholder - add your logic here)"
    }

@app.get("/api/integration/status")
async def integration_status():
    """Check integration status between Qubit and OpenHands."""
    try:
        openhands_response = requests.get(f"{OPENHANDS_URL}/api/health", timeout=2)
        openhands_ok = openhands_response.status_code == 200
    except:
        openhands_ok = False
    
    return {
        "qubit": {
            "status": "online",
            "port": 8000
        },
        "openhands": {
            "status": "online" if openhands_ok else "offline",
            "port": 3000,
            "url": OPENHANDS_URL
        },
        "integration": "ready" if openhands_ok else "waiting"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

