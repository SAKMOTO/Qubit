/**
 * Preload Script - Secure IPC Bridge
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchQubit: () => ipcRenderer.invoke('launch-qubit'),
  launchOpenHands: () => ipcRenderer.invoke('launch-openhands'),
  sendOpenHandsInput: (input) => ipcRenderer.invoke('send-openhands-input', input),
  stopProcess: (type) => ipcRenderer.invoke('stop-process', type),
  getStatus: () => ipcRenderer.invoke('get-status'),
  
  // Event listeners for streaming output
  onQubitOutput: (callback) => {
    ipcRenderer.on('qubit-output', (event, data) => callback(data));
  },
  onOpenHandsOutput: (callback) => {
    ipcRenderer.on('openhands-output', (event, data) => callback(data));
  },
  onOpenHandsTerminalData: (callback) => {
    ipcRenderer.on('openhands-terminal-data', (event, data) => callback(data));
  },
  onOpenHandsTerminalExit: (callback) => {
    ipcRenderer.on('openhands-terminal-exit', (event, code) => callback(code));
  },
  onQubitStatus: (callback) => {
    ipcRenderer.on('qubit-status', (event, status) => callback(status));
  },
  onOpenHandsStatus: (callback) => {
    ipcRenderer.on('openhands-status', (event, status) => callback(status));
  }
});
