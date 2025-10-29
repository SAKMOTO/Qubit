# 🚀 Qubit AI Browser Desktop

A beautiful, modern desktop application for AI-powered browser automation built with PyQt6 and Browser-Use.

## ✨ Features

- **Modern Dark UI**: Beautiful gradient design with smooth animations
- **Real-time Browser Control**: Watch AI perform tasks live in your browser
- **Cloud & Local Modes**: Use Browser-Use Cloud or local browser automation
- **Live Activity Logs**: See exactly what the AI is doing with timestamps
- **Progress Tracking**: Visual progress indicators and status updates
- **Headed/Headless Options**: Choose whether to see the browser window

## 🎯 What You Can Do

- "Find the latest AI news on Google"
- "Search YouTube for Python tutorials and click the first result"
- "Open GitHub and search for 'browser automation' repositories"
- "Go to Amazon and search for wireless headphones"
- And much more!

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- uv (recommended) or pip

### Installation

1. **Clone and setup**:
   ```bash
   git clone https://github.com/SAKMOTO/Qubit.git
   cd Qubit/qubit_desktop
   ```

2. **Create environment and install dependencies**:
   ```bash
   uv venv --python 3.11
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   uv pip install -r requirements.txt --prerelease=allow
   python -m playwright install chromium
   ```

3. **Set up API key** (for Cloud mode):
   ```bash
   export BROWSER_USE_API_KEY=your_key_here
   ```

4. **Run the app**:
   ```bash
   python -m qubit_desktop.main
   ```

## 🎨 UI Components

### Header
- Beautiful gradient background with app branding
- "Qubit AI Browser" title and subtitle

### Task Input Section
- Large text input for natural language tasks
- "🚀 Run Task" button with hover effects
- Cloud/Local mode toggle
- Headed/Headless mode toggle

### Status & Progress
- Real-time status updates with emojis
- Progress bar during task execution
- Color-coded success/failure states

### Activity Log
- Monospace font for easy reading
- Timestamps for each log entry
- Auto-scrolling to latest activity
- Color-coded log levels

## 🔧 Configuration

### Environment Variables
- `BROWSER_USE_API_KEY`: Required for Cloud mode (get from [browser-use.com](https://cloud.browser-use.com/new-api-key))

### Modes
- **Cloud Mode**: Uses Browser-Use Cloud service (recommended for reliability)
- **Local Mode**: Uses your system's browser (requires API key for Browser-Use)
- **Headed Mode**: Shows browser window (great for watching AI work)
- **Headless Mode**: Runs browser in background

## 📦 Building Installers

### macOS
```bash
pip install pyinstaller
pyinstaller --noconsole --name "Qubit" --icon resources/icons/qubit.icns main.py
```

### Windows
```bash
pip install pyinstaller
pyinstaller --noconsole --name "Qubit" --icon resources/icons/qubit.ico main.py
```

## 🗂️ Project Structure

```
qubit_desktop/
├── main.py              # App entry point
├── gui.py               # PyQt6 UI with modern styling
├── runner.py            # Browser-Use agent integration
├── requirements.txt     # Python dependencies
├── build_instructions.md # Build steps for installers
├── README.md           # This file
└── resources/          # Icons and assets (add your branding)
    └── icons/
```

## 🎨 Customization

### Branding
- Update window title in `gui.py`
- Replace icons in `resources/icons/`
- Modify colors in the `get_dark_theme()` method
- Update footer text with your company info

### Styling
- All styles are in `gui.py` using QSS (Qt Style Sheets)
- Easy to modify colors, fonts, and layouts
- Responsive design that works on different screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **"No module named 'qubit_desktop'"**
   - Run from project root: `cd /path/to/Qubit`
   - Set PYTHONPATH: `export PYTHONPATH=/path/to/Qubit`

2. **"Set BROWSER_USE_API_KEY"**
   - Get key from [browser-use.com](https://cloud.browser-use.com/new-api-key)
   - Or disable Cloud mode in the app

3. **Cloud timeouts**
   - Check internet connection
   - Try disabling Cloud mode
   - Use Headed mode for manual intervention

### Getting Help
- Check the activity log for detailed error messages
- Try different task descriptions
- Use Headed mode to see what's happening

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

- Built with [Browser-Use](https://browser-use.com/) for AI automation
- UI powered by PyQt6
- Icons and design by SAKMOTO

---

**Made with ❤️ by SAKMOTO | Powered by Browser-Use**
