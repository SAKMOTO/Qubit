/**
 * QubitDesktopApp - Electron Launcher with Embedded Terminal
 * Beautiful UI to launch Qubit Browser and OpenHands with live output
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const pty = require('node-pty');
const os = require('os');
const path = require('path');
const fs = require('fs');

let mainWindow;
let qubitProcess = null;
let openhandsProcess = null;
let openhandsTerminal = null;

// Root directory for bundled OpenHands backend (user placed it under backend/OpenHands)
const openHandsRoot = path.join(__dirname, '..', 'backend', 'OpenHands');

// Disable ALL security warnings and dialogs for local development
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-running-insecure-content');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-site-isolation-trials');

// Auto-approve all certificate errors BEFORE app ready
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Auto-approve all certificates
  event.preventDefault();
  callback(true);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    // Using user-provided icon path on this machine
    icon: '/Users/fathimabegum/Downloads/CompressJPEG.Online_img(512x512).jpg',
    frame: true,
    resizable: true,
    show: false
  });

  // Wait for React dev server and load
  const waitForReactServer = () => {
    const http = require('http');
    let attempts = 0;
    const maxAttempts = 10; // Reduced attempts
    let loaded = false;
    
    const checkServer = () => {
      if (loaded) return; // Prevent multiple loads
      
      attempts++;
      const req = http.get('http://localhost:3000', (res) => {
        // Server is ready!
        if (!loaded) {
          loaded = true;
          console.log('✅ React dev server is ready, loading app...');
          mainWindow.loadURL('http://localhost:3000');
        }
        req.destroy();
      });

      req.on('error', () => {
        req.destroy();
        if (attempts < maxAttempts && !loaded) {
          // Server not ready yet, wait and retry
          setTimeout(checkServer, 1000);
        } else if (!loaded) {
          // Give up, try loading anyway or use fallback
          loaded = true;
          console.log('⚠️ React dev server not responding, trying anyway...');
          mainWindow.loadURL('http://localhost:3000').catch(() => {
            const buildPath = path.join(__dirname, 'build', 'index.html');
            if (fs.existsSync(buildPath)) {
              mainWindow.loadFile(buildPath);
            } else {
              mainWindow.loadFile(path.join(__dirname, 'index.html'));
            }
          });
        }
      });

      req.setTimeout(500, () => {
        req.destroy();
      });
    };

    checkServer();
  };

  // Load React app
  if (process.env.NODE_ENV === 'production') {
    // Production: load from build folder
    const buildPath = path.join(__dirname, 'build', 'index.html');
    if (fs.existsSync(buildPath)) {
      mainWindow.loadFile(buildPath);
    } else {
      console.log('Build not found, trying dev server...');
      waitForReactServer();
    }
  } else {
    // Development: wait for React dev server
    console.log('⏳ Waiting for React dev server on http://localhost:3000...');
    waitForReactServer();
  }
  
  // Handle navigation errors - limited retries
  let retryCount = 0;
  const maxRetries = 2;
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -106 && retryCount < maxRetries) { // ERR_CONNECTION_REFUSED
      retryCount++;
      console.log(`React server not ready, retrying (${retryCount}/${maxRetries})...`);
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 2000);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle ALL certificate errors - auto-approve everything
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true); // Always accept
  });

  // Prevent all security dialogs
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log(`Load failed: ${errorCode} - ${errorDescription} for ${validatedURL}`);
  });


  if (process.env.NODE_ENV === 'development') {
    // Uncomment to open DevTools automatically
    // mainWindow.webContents.openDevTools();
  }
}

// Launch Qubit Browser
function launchQubit() {
  if (qubitProcess) {
    return { success: false, message: 'Qubit Browser is already running' };
  }

  const desktopQubit = path.join(require('os').homedir(), 'Desktop', 'Qubit');
  const qubitVenv = path.join(desktopQubit, 'qubit_desktop', '.venv');
  
  let pythonExec = 'python3';
  if (fs.existsSync(qubitVenv)) {
    const venvPython = path.join(qubitVenv, 'bin', 'python');
    if (fs.existsSync(venvPython)) {
      pythonExec = venvPython;
    }
  }

  const qubitDesktopMain = path.join(desktopQubit, 'qubit_desktop', 'main.py');
  
  if (!fs.existsSync(qubitDesktopMain)) {
    return { success: false, message: 'Qubit not found at ~/Desktop/Qubit' };
  }

  const env = { ...process.env };
  env.PYTHONPATH = desktopQubit;
  env.BROWSER_USE_API_KEY = process.env.BROWSER_USE_API_KEY || 'bu_iQgbGmDNq1LeEPtaY9Fk7FdGNCKXBZrH0INbDtGsx4I';

  try {
    // Launch with stdio pipes to capture output
    qubitProcess = spawn(pythonExec, ['-m', 'qubit_desktop.main'], {
      cwd: desktopQubit,
      env: env,
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
      shell: false
    });

    // Stream stdout to renderer
    qubitProcess.stdout.setEncoding('utf8');
    qubitProcess.stdout.on('data', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const output = typeof data === 'string' ? data : data.toString();
        mainWindow.webContents.send('qubit-output', output);
      }
    });

    // Stream stderr to renderer
    qubitProcess.stderr.setEncoding('utf8');
    qubitProcess.stderr.on('data', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const output = typeof data === 'string' ? data : data.toString();
        mainWindow.webContents.send('qubit-output', output);
      }
    });

    qubitProcess.on('error', (error) => {
      console.error('Qubit launch error:', error);
      if (mainWindow) {
        mainWindow.webContents.send('qubit-output', `\n[ERROR] ${error.message}\n`);
      }
      qubitProcess = null;
    });

    qubitProcess.on('exit', (code) => {
      if (mainWindow) {
        mainWindow.webContents.send('qubit-output', `\n[Process exited with code ${code}]\n`);
        mainWindow.webContents.send('qubit-status', false);
      }
      qubitProcess = null;
    });

    if (mainWindow) {
      mainWindow.webContents.send('qubit-status', true);
      mainWindow.webContents.send('qubit-output', '[Qubit Browser started]\n');
    }

    return { success: true, message: 'Qubit Browser launched successfully!' };
  } catch (error) {
    qubitProcess = null;
    return { success: false, message: `Failed to launch: ${error.message}` };
  }
}

// Launch OpenHands with REAL interactive terminal (PTY)
function launchOpenHands() {
  if (openhandsTerminal || openhandsProcess) {
    return { success: false, message: 'OpenHands is already running' };
  }

  try {
    // Force using the spawn-based fallback path below so that
    // output is sent via 'openhands-output' and displayed in the
    // text-based terminal in the React app (useRealTerminal = false).
    throw new Error('Force spawn fallback for OpenHands');

    const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';
    
    console.log(`Launching OpenHands terminal with shell: ${shell}`);

    // Use a fresh config dir to avoid corrupted user config
    const userDataPath = app.getPath('userData');
    const freshConfigRoot = path.join(userDataPath, 'openhands_config');
    const freshHome = path.join(freshConfigRoot, 'home');
    try {
      fs.mkdirSync(freshConfigRoot, { recursive: true });
      fs.mkdirSync(freshHome, { recursive: true });
    } catch (_) {}
    const cleanEnv = { ...process.env, XDG_CONFIG_HOME: freshConfigRoot, HOME: freshHome };

    // Create a real PTY (pseudo-terminal) for interactive terminal
    openhandsTerminal = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      // Run inside the OpenHands backend folder so `uvx --python 3.12 openhands` works
      cwd: fs.existsSync(openHandsRoot) ? openHandsRoot : process.cwd(),
      env: cleanEnv,
      handleFlowControl: false
    });

    // Send terminal output to renderer (real-time) with filtering
    const filterNoise = (chunk) => {
      if (!chunk) return chunk;
      const lines = chunk.split(/\r?\n/);
      const filtered = lines.filter((l) => {
        const s = l.trim();
        if (!s) return true;
        if (s.includes('Agent configuration file is corrupted!')) return false;
        if (s.includes("terminal doesn't support cursor position requests") || s.includes('CPR')) return false;
        return true;
      });
      return filtered.join('\n');
    };

    openhandsTerminal.onData((data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const cleaned = filterNoise(data);
        if (cleaned && cleaned.length) {
          mainWindow.webContents.send('openhands-terminal-data', cleaned);
        }
      }
    });

    openhandsTerminal.onExit((code) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('openhands-terminal-exit', code);
        mainWindow.webContents.send('openhands-status', false);
      }
      openhandsTerminal = null;
      openhandsProcess = null;
    });

    // Start OpenHands command in the terminal
    const pythonVersion = '3.12';
    const command = `uvx --python ${pythonVersion} openhands\n`;
    openhandsTerminal.write(command);

    openhandsProcess = { pty: openhandsTerminal }; // Keep reference

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('openhands-status', true);
    }

    return { success: true, message: 'OpenHands terminal launched successfully' };
  } catch (error) {
    console.error('PTY launch error (or forced fallback):', error);
    // Fallback to spawn if PTY fails or we deliberately force it
    try {
      let pythonVersion = '3.12';
      // Use the same clean config env in fallback
      const userDataPath = app.getPath('userData');
      const freshConfigRoot = path.join(userDataPath, 'openhands_config');
      const freshHome = path.join(freshConfigRoot, 'home');
      try { fs.mkdirSync(freshConfigRoot, { recursive: true }); fs.mkdirSync(freshHome, { recursive: true }); } catch (_) {}
      const cleanEnv = { ...process.env, XDG_CONFIG_HOME: freshConfigRoot, HOME: freshHome };
      openhandsProcess = spawn('uvx', ['--python', pythonVersion, 'openhands'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
        env: cleanEnv,
        // Ensure fallback OpenHands also runs from backend/OpenHands when present
        cwd: fs.existsSync(openHandsRoot) ? openHandsRoot : process.cwd()
      });

      openhandsProcess.stdout.setEncoding('utf8');
      const filterNoise = (chunk) => {
        if (!chunk) return chunk;
        const text = typeof chunk === 'string' ? chunk : chunk.toString();
        const lines = text.split(/\r?\n/);
        const filtered = lines.filter((l) => {
          const s = l.trim();
          if (!s) return true;
          if (s.includes('Agent configuration file is corrupted!')) return false;
          if (s.includes("terminal doesn't support cursor position requests") || s.includes('CPR')) return false;
          return true;
        });
        return filtered.join('\n');
      };

      openhandsProcess.stdout.on('data', (data) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          const cleaned = filterNoise(data);
          if (cleaned && cleaned.length) {
            mainWindow.webContents.send('openhands-output', cleaned);
          }
        }
      });

      openhandsProcess.stderr.setEncoding('utf8');
      openhandsProcess.stderr.on('data', (data) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          const cleaned = filterNoise(data);
          if (cleaned && cleaned.length) {
            mainWindow.webContents.send('openhands-output', cleaned);
          }
        }
      });

      openhandsProcess.on('exit', (code) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('openhands-status', false);
        }
        openhandsProcess = null;
      });

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('openhands-status', true);
      }

      return { success: true, message: 'OpenHands launched (fallback mode)' };
    } catch (fallbackError) {
      openhandsProcess = null;
      return { success: false, message: `Failed to launch: ${error.message}` };
    }
  }
}

// Send input to OpenHands terminal (REAL terminal interaction)
function sendOpenHandsInput(input) {
  if (openhandsTerminal) {
    try {
      openhandsTerminal.write(input);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  // Fallback to stdin if using spawn
  if (openhandsProcess && openhandsProcess.stdin && !openhandsProcess.pty) {
    try {
      openhandsProcess.stdin.write(input + '\n');
      if (mainWindow) {
        mainWindow.webContents.send('openhands-output', `\n> ${input}\n`);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  return { success: false, message: 'OpenHands is not running' };
}

// Stop a process
function stopProcess(type) {
  if (type === 'qubit' && qubitProcess) {
    qubitProcess.kill();
    qubitProcess = null;
    return { success: true, message: 'Qubit Browser stopped' };
  } else if (type === 'openhands') {
    if (openhandsTerminal) {
      try {
        openhandsTerminal.kill();
        openhandsTerminal = null;
        openhandsProcess = null;
        return { success: true, message: 'OpenHands stopped' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
    if (openhandsProcess) {
      try {
        if (openhandsProcess.kill) {
          openhandsProcess.kill();
        }
        openhandsProcess = null;
        return { success: true, message: 'OpenHands stopped' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }
  return { success: false, message: 'Process not running' };
}

// IPC handlers
ipcMain.handle('launch-qubit', async () => {
  return launchQubit();
});

ipcMain.handle('launch-openhands', async () => {
  return launchOpenHands();
});

ipcMain.handle('send-openhands-input', async (event, input) => {
  return sendOpenHandsInput(input);
});

ipcMain.handle('stop-process', async (event, type) => {
  return stopProcess(type);
});

ipcMain.handle('get-status', async () => {
  return {
    qubit: qubitProcess !== null,
    openhands: openhandsProcess !== null
  };
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (qubitProcess) {
    try {
      qubitProcess.kill();
    } catch (e) {}
  }
  if (openhandsTerminal) {
    try {
      openhandsTerminal.kill();
    } catch (e) {}
  }
  if (openhandsProcess) {
    try {
      if (openhandsProcess.kill) {
        openhandsProcess.kill();
      }
    } catch (e) {}
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (qubitProcess) {
    qubitProcess.kill();
  }
  if (openhandsTerminal) {
    openhandsTerminal.kill();
  }
  if (openhandsProcess) {
    if (openhandsProcess.kill) {
      openhandsProcess.kill();
    }
  }
});
