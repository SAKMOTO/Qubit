# 🚀 How It Works - Complete Flow

## When You Run `npm start` (Electron Frontend)

### Step-by-Step Process:

1. **Electron Starts** (`frontend/main.js`)
   - Opens Electron window
   - Calls `startBackend()`
   - Launches `backend/start.py` script

2. **Backend Setup** (`backend/start.py`)
   - Creates Python virtual environment (if needed)
   - Installs dependencies
   - Finds Qubit at `/Users/fathimabegum/Desktop/Qubit`

3. **Qubit Activation** (Automatic!)
   - Activates Qubit's venv: `qubit_desktop/.venv/bin/python`
   - Sets `PYTHONPATH=/Users/fathimabegum/Desktop/Qubit`
   - Sets `BROWSER_USE_API_KEY=bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I`
   - Verifies PyQt6 WebEngine: `import PyQt6.QtWebEngineWidgets`

4. **Launches Two Things**:
   - ✅ **FastAPI Server** (`main.py`) - For Electron web interface on port 8000
   - ✅ **Qubit AI Browser** (`python -m qubit_desktop.main`) - Your PyQt6 desktop app!

5. **Result**:
   - 🖥️ **Qubit AI Browser window opens** - The PyQt6 desktop application you normally use
   - 🌐 **Electron window opens** - Shows Qubit's web interface (if FastAPI server exists)
   - 🤖 **OpenHands starts** - On port 3000

## What Gets Launched

### Qubit AI Browser (Desktop App)
- **Command**: `python -m qubit_desktop.main`
- **Location**: `/Users/fathimabegum/Desktop/Qubit/qubit_desktop/main.py`
- **Type**: PyQt6 GUI application
- **Opens**: Native desktop window (the one you normally click)

### FastAPI Web Server (Optional)
- **Command**: `python -m uvicorn main:app --host 127.0.0.1 --port 8000`
- **Location**: `/Users/fathimabegum/Desktop/Qubit/main.py`
- **Type**: Web server for Electron to load
- **Opens**: Electron window loads this URL

## Commands Executed Automatically

```bash
# 1. Activate venv (automatic via python path)
/Users/fathimabegum/Desktop/Qubit/qubit_desktop/.venv/bin/python

# 2. Verify PyQt6 (automatic check)
python -c "import PyQt6.QtWebEngineWidgets as w; print('WebEngine OK')"

# 3. Set environment (automatic)
export PYTHONPATH=/Users/fathimabegum/Desktop/Qubit
export BROWSER_USE_API_KEY=bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I

# 4. Launch Qubit AI Browser (automatic!)
python -m qubit_desktop.main

# 5. Start FastAPI server (if main.py exists)
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## What You'll See

When you run `npm start`:

1. **Terminal Output**:
   ```
   ✅ Found Qubit at: /Users/fathimabegum/Desktop/Qubit
   🚀 Starting Qubit desktop application...
   ✅ PyQt6 WebEngine verified
   🖥️  Launching Qubit AI Browser desktop application...
   ✅ Qubit AI Browser desktop app launched
   ```

2. **Desktop Windows**:
   - **Qubit AI Browser** window opens (PyQt6 GUI) ✅
   - **Electron** window opens (if FastAPI server available) ✅

3. **Background Services**:
   - Qubit FastAPI server: http://127.0.0.1:8000
   - OpenHands: http://127.0.0.1:3000

## Summary

**One click (`npm start`) → Everything launches automatically!**
- ✅ Qubit AI Browser (your desktop app)
- ✅ FastAPI web server
- ✅ OpenHands integration
- ✅ Electron wrapper

No manual commands needed! 🎉





