# 🔧 Troubleshooting Guide

## Problem: `ERR_CONNECTION_REFUSED` on Startup

This is **normal** on first run! The backend needs time to:
1. Create Python virtual environment
2. Install dependencies (can take 2-5 minutes)
3. Start Qubit server

### What's Happening:

```
Electron starts → Tries to connect immediately
Backend is still installing → Connection refused
Backend finishes → Server starts → Electron connects ✅
```

### Solutions:

#### ✅ Solution 1: Wait Longer (Recommended)
The app now waits up to **2 minutes** (60 attempts × 2 seconds) for the backend.
- First run: Be patient! Dependencies take time to install
- Subsequent runs: Backend starts faster (~10-20 seconds)

#### ✅ Solution 2: Check Backend Logs
Look at the terminal/console output. You should see:
```
🚀 Starting Qubit + OpenHands Auto Setup...
📦 Creating virtual environment...
📥 Installing dependencies...
🚀 Starting Qubit backend...
✅ Qubit backend started
```

#### ✅ Solution 3: Manual Check
Open your browser and go to: `http://localhost:8000`
- If it loads → Backend is running! Electron will connect.
- If it doesn't → Backend is still starting, wait a bit.

## Problem: Backend Keeps Failing to Start

### Check 1: Python Version
```bash
python3 --version
```
Should be **Python 3.8 or higher**

### Check 2: Qubit Files Exist
```bash
ls backend/Qubit_backend/Qubit/main.py
```
Should show the file path.

### Check 3: Run Backend Manually
```bash
cd backend
python3 start.py
```
This will show you exactly what's failing.

## Problem: Port 8000 Already in Use

### Find What's Using Port 8000:
```bash
# macOS/Linux
lsof -i :8000

# Kill it
kill -9 <PID>
```

### Or Change Port:
Edit `backend/Qubit_backend/Qubit/main.py`:
```python
uvicorn.run(app, host="127.0.0.1", port=8001)  # Changed to 8001
```
Then update `frontend/main.js`:
```javascript
mainWindow.loadURL('http://localhost:8001');
```

## Problem: Dependencies Won't Install

### Try Manual Installation:
```bash
# Create venv
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r backend/Qubit_backend/requirements.txt
pip install -r backend/Qubit_backend/Qubit/requirements.txt
```

## Problem: Electron Opens Blank/White Screen

### Solution 1: Wait for Backend
The window opens before the backend is ready. Wait 30-60 seconds and refresh.

### Solution 2: Check DevTools
The app opens DevTools in development mode. Check the Console tab for errors.

### Solution 3: Use Custom HTML Instead
Edit `frontend/main.js`:
```javascript
// Comment out this line:
// mainWindow.loadURL('http://localhost:8000');

// Uncomment this:
mainWindow.loadFile(path.join(__dirname, 'index.html'));
```

## Problem: "Qubit main.py not found"

This means the Qubit folder isn't in the right place.

### Fix:
1. Make sure your Qubit folder is at: `backend/Qubit_backend/Qubit/`
2. Make sure `Qubit/main.py` exists
3. Structure should be:
   ```
   backend/
     └── Qubit_backend/
         └── Qubit/
             └── main.py  ← This file must exist
   ```

## Quick Diagnostic Commands

```bash
# Check Python
python3 --version

# Check if Qubit exists
ls -la backend/Qubit_backend/Qubit/main.py

# Check if backend script exists
ls -la backend/start.py

# Test backend manually
cd backend && python3 start.py

# Test Qubit server directly
cd backend/Qubit_backend/Qubit && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## Still Not Working?

1. **Check all logs** - Both Electron console and terminal output
2. **Try running backend separately** - `python3 backend/start.py`
3. **Check file permissions** - Make sure Python can read all files
4. **Verify network** - Ports 8000 and 3000 should be free

---

**Most Common Fix**: Just wait 2-3 minutes on first run! Dependencies take time to install. 🕐





