// Global variables
let socket = null;
let sessionId = null;
let isRunning = false;

// DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const refreshBtn = document.getElementById('refreshBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const taskInput = document.getElementById('taskInput');
const apiKeyInput = document.getElementById('apiKey');
const browserView = document.getElementById('browserView');
const actionLogs = document.getElementById('actionLogs');
const statusIndicator = document.getElementById('statusIndicator');

// Event listeners
startBtn.addEventListener('click', startSession);
stopBtn.addEventListener('click', stopSession);
refreshBtn.addEventListener('click', requestScreenshot);
clearLogsBtn.addEventListener('click', clearLogs);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addLog('info', 'System initialized. Ready to start tasks.');
});

/**
 * Start a new browser session
 */
async function startSession() {
    const task = taskInput.value.trim();
    
    if (!task) {
        addLog('error', 'Please enter a task');
        return;
    }

    try {
        // Disable start button
        startBtn.disabled = true;
        updateStatus('connecting', 'Starting session...');
        addLog('info', 'Initializing new session...');

        // Create session
        const response = await fetch('/start-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: task,
                api_key: apiKeyInput.value || null
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();
        sessionId = data.session_id;

        addLog('status', `Session created: ${sessionId}`);
        addLog('status', 'Connecting to WebSocket...');

        // Connect WebSocket
        connectWebSocket(sessionId);

    } catch (error) {
        console.error('Error starting session:', error);
        addLog('error', `Failed to start session: ${error.message}`);
        updateStatus('error', 'Error');
        startBtn.disabled = false;
    }
}

/**
 * Connect to WebSocket
 */
function connectWebSocket(sessionId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}`;

    addLog('status', `Connecting to: ${wsUrl}`);

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        addLog('info', 'WebSocket connected successfully');
        updateStatus('connecting', 'Connected');
        isRunning = true;
        stopBtn.disabled = false;
    };

    socket.onmessage = (event) => {
        handleWebSocketMessage(event);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('error', 'WebSocket connection error');
        updateStatus('error', 'Connection Error');
    };

    socket.onclose = () => {
        addLog('warning', 'WebSocket connection closed');
        updateStatus('ready', 'Ready');
        resetUI();
    };
}

/**
 * Handle WebSocket messages
 */
function handleWebSocketMessage(event) {
    try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
            case 'connected':
                addLog('info', message.message);
                break;
                
            case 'status':
                addLog('status', message.message);
                updateStatus('connecting', 'Running...');
                break;
                
            case 'result':
                addLog('info', message.message);
                if (message.screenshot) {
                    displayScreenshot(message.screenshot);
                }
                if (message.result) {
                    addLog('info', `Result: ${message.result}`);
                }
                updateStatus('ready', 'Completed');
                break;
                
            case 'screenshot':
                if (message.screenshot) {
                    displayScreenshot(message.screenshot);
                }
                break;
                
            case 'error':
                addLog('error', message.message);
                updateStatus('error', 'Error');
                break;
                
            default:
                console.log('Unknown message type:', message.type);
        }
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        addLog('error', 'Failed to parse message');
    }
}

/**
 * Display screenshot in browser view
 */
function displayScreenshot(screenshotData) {
    browserView.innerHTML = `<img src="${screenshotData}" alt="Browser Screenshot">`;
    addLog('status', 'Screenshot updated');
}

/**
 * Request a new screenshot
 */
function requestScreenshot() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'screenshot' }));
        addLog('status', 'Requesting screenshot...');
    } else {
        addLog('warning', 'No active connection');
    }
}

/**
 * Stop the current session
 */
async function stopSession() {
    if (!sessionId) return;

    try {
        addLog('status', 'Stopping session...');
        
        // Close WebSocket
        if (socket) {
            socket.close();
            socket = null;
        }

        // Call stop endpoint
        const response = await fetch(`/stop-session/${sessionId}`, {
            method: 'POST'
        });

        if (response.ok) {
            addLog('info', 'Session stopped successfully');
        }

    } catch (error) {
        console.error('Error stopping session:', error);
        addLog('error', `Failed to stop session: ${error.message}`);
    } finally {
        resetUI();
    }
}

/**
 * Reset UI to initial state
 */
function resetUI() {
    isRunning = false;
    sessionId = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Reset browser view
    browserView.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">🌐</div>
            <p>Browser view will appear here</p>
            <p class="placeholder-hint">Start a task to see live browser interaction</p>
        </div>
    `;
    
    updateStatus('ready', 'Ready');
}

/**
 * Update status indicator
 */
function updateStatus(type, text) {
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    // Remove all status classes
    statusDot.classList.remove('connecting', 'error');
    
    // Add appropriate class
    if (type === 'connecting') {
        statusDot.classList.add('connecting');
    } else if (type === 'error') {
        statusDot.classList.add('error');
    }
    
    statusText.textContent = text;
}

/**
 * Add log entry
 */
function addLog(type, message) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    
    logEntry.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span class="log-message">${escapeHtml(message)}</span>
    `;
    
    actionLogs.insertBefore(logEntry, actionLogs.firstChild);
    
    // Limit log entries to 100
    while (actionLogs.children.length > 100) {
        actionLogs.removeChild(actionLogs.lastChild);
    }
}

/**
 * Clear all logs
 */
function clearLogs() {
    actionLogs.innerHTML = '';
    addLog('info', 'Logs cleared');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});
