# Qubit Desktop

A beautiful quantum-inspired desktop launcher for **Qubit Browser** and **OpenHands CLI**, built with **Electron + React**.

Qubit Desktop lets users:

- **Launch Qubit Browser** with live terminal logs
- **Run OpenHands CLI** from a friendly UI
- Use a **modern dashboard** with animated hero, feature cards, and a macOS-style dock
- Manage **Profile** and **Settings** with rich UI components

This repository contains the **Electron front-end** of Qubit Desktop.

---

## ✨ Features

- **Electron Desktop App**
  - Cross‑platform Electron shell (currently focused on macOS arm64 build)
  - Custom window and app icon

- **React UI**
  - Animated hero section using `@splinetool/react-spline` and `gsap`
  - Dock-style navigation for **Home · Archive · Profile · Settings**
  - Modern glassmorphism styling and Lucide icons

- **Profile & Settings Pages**
  - Enhanced `Profile` page with avatar, tabs, and quantum-themed sections
  - Powerful `Settings` page with theme, language, accessibility, and more

- **Integrated Terminals**
  - Qubit Browser logs panel
  - OpenHands CLI text terminal with message input
  - IPC bridge between renderer and Electron main process for process control

- **Packaging**
  - Production React build (`npm run react-build`)
  - Electron Forge `make` flow for macOS zip / app

---

## 📺 SaaS Explainer Video

Watch the short explainer video that introduces Qubit Desktop and how it works:

- **Explainer Video (Google Drive):**  
  https://drive.google.com/file/d/15KpvmKIi9fG_tfumIqvJYcXrCD3SywQs/view?usp=sharing

> If the video does not autoplay on GitHub, open the link in a browser to view the full SaaS explainer.

---

## 🌐 Live Demo (Web)

If you deploy a limited web version of the UI (without Electron), link it here.

- **Live Demo:** *(to be added)*  
  e.g. `https://qubit-desktop.vercel.app` or `https://qubit-desktop.netlify.app`

**Notes:**

- The full desktop experience (Qubit Browser launcher + OpenHands integration) runs best in the **Electron app**.
- A web demo can show the **Home / Profile / Settings** UI and animations for recruiters and users.

---

## 🧱 Tech Stack

- **Frontend:** React 18, React Router, React Scripts (CRA)
- **Desktop Shell:** Electron
- **Styling & Motion:** CSS, GSAP, `@splinetool/react-spline`, `lucide-react`
- **Terminal:** `xterm` (infrastructure present, using safer text mode by default)
- **Build & Packaging:**
  - React: `react-scripts build`
  - Electron packaging: **Electron Forge** (`npx electron-forge make`)

---

## 🗂 Project Structure (frontend)

```text
frontend/
  main.js              # Electron main process (BrowserWindow, IPC, process control)
  preload.js           # Preload script exposing safe electronAPI to renderer
  forge.config.js      # Electron Forge configuration
  public/
    index.html
    electron.js        # Shim/entry for some build flows
  src/
    App.js             # Main React app, HashRouter + routes + dashboard
    App.css
    components/
      Dock.jsx
      Terminal.jsx
      CardSwap.jsx
      ErrorBoundary.js
      ...
    pages/
      Profile.js
      Profile.css
      Settings.js
      Archive.js
  build/               # Production React build (generated)
  out/                 # Forge output (generated: .app, .zip, etc.)
```

---

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js and npm installed (recent LTS recommended)
- macOS (current packaging flow is tuned for macOS arm64)

### Install dependencies

```bash
cd /Users/your-username/Desktop/fukkk/frontend
npm install
```

### Run in development mode

This starts both the React dev server and Electron pointing at it.

```bash
cd /Users/your-username/Desktop/fukkk/frontend
npm run dev
```

- React runs on `http://localhost:3000`
- Electron opens a desktop window loading that URL

> During development, if you see a black window, make sure the React dev server is running (`npm run dev`).

---

## 📦 Building the Production Desktop App

To build a production desktop app for **macOS (arm64)**:

1. **Build React for production**

   ```bash
   cd /Users/your-username/Desktop/fukkk/frontend
   npm run react-build
   ```

   This creates the `build/` folder used in production.

2. **Make the Electron app with Forge**

   ```bash
   npx electron-forge make
   ```

   This generates distributables under:

   ```text
   frontend/out/make/
     zip/darwin/arm64/Qubit-<version>-darwin-arm64.zip
   ```

3. **Distribute to users**

   - Share the generated **zip** from `out/make/zip/darwin/arm64/`
   - Users:
     - Download the zip
     - Extract it
     - Double‑click `Qubit.app`

No `npm` or terminal commands are required for end users.

---

## 🔁 Routing and Electron

The app uses **`HashRouter`** from `react-router-dom` so that routes work correctly when loading from `file://` inside Electron:

- URLs look like `index.html#/`, `index.html#/profile`, `index.html#/settings`.
- This avoids the "No routes matched location .../index.html" issue when loading from the packaged app.

---

## 🧪 Scripts (frontend/package.json)

Useful npm scripts:

```jsonc
{
  "scripts": {
    "start": "electron-forge start",           // Dev: Electron only (expects dev server)
    "react-start": "BROWSER=none react-scripts start", // CRA dev server
    "react-build": "react-scripts build",      // Build React for production
    "dev": "NODE_ENV=development concurrently \"npm run react-start\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "npm run react-build && electron-builder", // Legacy/advanced packaging
    "build:mac": "npm run react-build && electron-builder --mac"
  }
}
```

For day‑to‑day development, the main commands are:

```bash
npm run dev          # Dev: React + Electron
npm run react-build  # Build React only
npx electron-forge make  # Package desktop app
```

---

## 🧠 Future Improvements

- Windows `.exe` and Linux `.AppImage` packaging
- Better error boundaries and logging in production
- Hosted web demo (Vercel / Netlify) for UI-only preview
- Deeper integration with Qubit backend services and OpenHands
- More quantum‑themed visualizations and onboarding flows

---

## 📬 Contact

You can customize this section with your real contact info:

- **GitHub:** [SAKMOTO](https://github.com/SAKMOTO)
- **Email:** your-email@example.com

---

> _This README is optimized for recruiters, collaborators, and users visiting the GitHub repository. It highlights the architecture, features, and how to build/run the app._
