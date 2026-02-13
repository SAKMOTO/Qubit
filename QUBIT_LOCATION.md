# 📍 Qubit Application Location

## ✅ Your Qubit Application Location

Your Qubit application is located at:
```
/Users/fathimabegum/Desktop/Qubit
```

## 🚀 How You Normally Run It

```bash
cd /Users/fathimabegum/Desktop/Qubit
source qubit_desktop/.venv/bin/activate
python -c "import PyQt6.QtWebEngineWidgets as w; print('WebEngine OK')"
export PYTHONPATH=/Users/fathimabegum/Desktop/Qubit
export BROWSER_USE_API_KEY=bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I
python -m qubit_desktop.main
```

## 🔧 What I Updated

The `backend/start.py` script now:

1. ✅ **Checks Desktop/Qubit first** - Looks for your actual application
2. ✅ **Uses Qubit's venv** - If `qubit_desktop/.venv` exists, uses that Python
3. ✅ **Sets environment variables** - PYTHONPATH and BROWSER_USE_API_KEY
4. ✅ **Starts FastAPI server** - Runs `main.py` as a web server (if it exists)

## 📂 Expected Structure

```
/Users/fathimabegum/Desktop/Qubit/
├── main.py                          # FastAPI server (if available)
├── requirements.txt                 # Dependencies
├── qubit_desktop/
│   ├── .venv/                       # Virtual environment (your existing one)
│   ├── main.py                      # Desktop app entry point
│   ├── gui.py                       # PyQt6 GUI
│   └── requirements.txt             # Desktop app dependencies
└── ...
```

## 🎯 How It Works Now

When you run `npm start`:

1. **Script checks** for Qubit at `~/Desktop/Qubit`
2. **If found**:
   - Uses Qubit's venv (if exists) or creates one
   - Sets PYTHONPATH and BROWSER_USE_API_KEY
   - Starts FastAPI server from `main.py`
   - Runs on port 8000
3. **Electron opens** → Loads http://localhost:8000

## ⚙️ Environment Variables

The script automatically sets:
- `PYTHONPATH=/Users/fathimabegum/Desktop/Qubit`
- `BROWSER_USE_API_KEY=bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I`

## 🔄 If Qubit Has FastAPI Server

If `~/Desktop/Qubit/main.py` exists and has a FastAPI `app`:
- ✅ It will be started on port 8000
- ✅ Electron will load it automatically

## 🔄 If Qubit Is Only Desktop App

If there's no FastAPI server in `main.py`:
- ⚠️ The script will fallback to the integration wrapper
- 💡 You might want to add a FastAPI server to `main.py` for web access

## 🛠️ Customization

To use a different API key, edit `backend/start.py`:
```python
env['BROWSER_USE_API_KEY'] = 'your-key-here'
```

Or set it as an environment variable before running:
```bash
export BROWSER_USE_API_KEY=your-key-here
npm start
```

---

**Your Qubit application is now automatically detected and used! 🎉**





