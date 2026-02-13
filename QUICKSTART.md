# ⚡ Quick Start Guide

Get your Qubit + OpenHands desktop app running in **3 minutes**!

## Step 1: Install Node.js Dependencies

```bash
cd frontend
npm install
```

## Step 2: Add Your Qubit Backend

Copy your existing Qubit backend code into:
```
backend/Qubit_backend/
```

Make sure your `main.py` has a FastAPI app named `app`:
```python
from fastapi import FastAPI
app = FastAPI()
# ... your code ...
```

## Step 3: Run!

```bash
npm start
```

That's it! 🎉

The app will:
- ✅ Auto-create Python virtual environment
- ✅ Install all dependencies
- ✅ Start Qubit backend (port 8000)
- ✅ Start OpenHands (port 3000)
- ✅ Open Electron window

## Next Steps

- **Build for production**: `npm run build`
- **Customize UI**: Edit `frontend/index.html`
- **Add Qubit logic**: Edit `backend/Qubit_backend/main.py`

---

**Troubleshooting?** See the main [README.md](./README.md)





