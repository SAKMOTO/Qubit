# 🖥️ Primary Window Setup - Qubit AI Browser Only

## ✅ What Changed

Now when you run `npm start`, **only the Qubit AI Browser desktop app opens** - no Electron window!

## 🚀 How to Run

### Default (Qubit AI Browser Only - No Electron Window)
```bash
cd frontend
npm start
```

**Result**: 
- ✅ Qubit AI Browser opens (PyQt6 desktop app - PRIMARY WINDOW)
- ❌ Electron window does NOT open
- ✅ Backend runs in background

### If You Want Electron Window Too
```bash
cd frontend
npm run start:with-ui
```

**Result**:
- ✅ Qubit AI Browser opens
- ✅ Electron window also opens (web interface)

## 📱 What Happens Now

1. **Backend starts automatically**
   - Creates venv (if needed)
   - Installs dependencies
   - Sets environment variables

2. **Qubit AI Browser launches**
   - Opens as PRIMARY window
   - Your PyQt6 desktop app

3. **Electron stays hidden**
   - Runs in background
   - Manages backend processes
   - No window shown (unless you use `start:with-ui`)

## 🎯 Primary Window = Qubit AI Browser

The Python/PyQt6 desktop app (`qubit_desktop.main`) is now the **PRIMARY** interface.

Electron just manages the backend silently in the background.

## 🔧 To Show Electron Window Later

If you want to see the Electron/web interface:

```bash
cd frontend
SHOW_ELECTRON=true npm start
```

Or use the npm script:
```bash
npm run start:with-ui
```

## 📋 Summary

| Command | Qubit Desktop App | Electron Window |
|---------|------------------|-----------------|
| `npm start` | ✅ Opens | ❌ Hidden |
| `npm run start:with-ui` | ✅ Opens | ✅ Opens |

**Default behavior: Qubit AI Browser is PRIMARY, Electron is background! 🎉**





