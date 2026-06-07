# ⚡ Qubit Desktop App

Beautiful Electron launcher for Qubit Browser and OpenHands.

## ✨ Features

- 🎨 Beautiful, modern UI
- 🚀 One-click launcher for Qubit Browser
- 🤖 One-click launcher for OpenHands
- 🖥️ No terminal needed - everything runs in background
- ✅ Status indicators for running apps

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run the App

```bash
npm start
```

### 3. Use the App

- Click **"Launch Qubit Browser"** to start Qubit
- Click **"Launch OpenHands"** to start OpenHands
- Apps run silently in background
- Status shows when apps are running

## 📦 Build for Production

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Built apps will be in `frontend/dist/`

## 📋 Requirements

- **Python 3.8+** installed
- **Qubit** at `~/Desktop/Qubit`
- **OpenHands** installed (`pip install openhands uv`)

## 🎯 How It Works

1. **Launch Qubit Browser**
   - Runs: `python -m qubit_desktop.main`
   - Uses venv from `~/Desktop/Qubit/qubit_desktop/.venv`
   - Sets required environment variables
   - Launches silently in background

2. **Launch OpenHands**
   - Runs: `uvx --python 3.12 openhands serve`
   - Starts on `http://localhost:3000`
   - Runs silently in background

## 🔧 Configuration

### Qubit Location
The app looks for Qubit at: `~/Desktop/Qubit`

To change this, edit `frontend/main.js`:
```javascript
const desktopQubit = path.join(require('os').homedir(), 'Desktop', 'Qubit');
```

### API Key
Set `BROWSER_USE_API_KEY` environment variable, or it uses default.

## 📁 Project Structure

```
QubitDesktopApp/
├── frontend/
│   ├── main.js          # Electron main process
│   ├── preload.js       # IPC bridge
│   ├── index.html       # Launcher UI
│   └── package.json     # Dependencies & build config
└── README.md
```

## 🎨 UI Features

- **Beautiful gradient background**
- **Glass-morphism design**
- **Smooth animations**
- **Status feedback**
- **Loading indicators**

## 🐛 Troubleshooting

**Qubit not launching?**
- Check if Qubit exists at `~/Desktop/Qubit`
- Verify `qubit_desktop/.venv` exists
- Check Python version (3.8+)

**OpenHands not launching?**
- Install: `pip install openhands uv`
- Check if `uvx` command works in terminal
- Verify Python 3.12 is available

## 📄 License

MIT

---

**Made with ❤️ for easy AI tool launching**
