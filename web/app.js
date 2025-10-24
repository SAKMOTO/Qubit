const apiKeyEl = document.getElementById('apiKey');
const taskEl = document.getElementById('task');
const runBtn = document.getElementById('runBtn');
const stopBtn = document.getElementById('stopBtn');
const logsEl = document.getElementById('logs');

let evtSource = null;

function appendLog(text) {
  const line = document.createElement('div');
  line.className = 'log-line';
  line.textContent = text;
  logsEl.appendChild(line);
  logsEl.scrollTop = logsEl.scrollHeight;
}

async function startRun() {
  const api_key = apiKeyEl.value.trim();
  const task = taskEl.value.trim();
  if (!api_key) {
    alert('Please enter your Browser Use Cloud API key.');
    return;
  }
  if (!task) {
    alert('Please enter a task.');
    return;
  }

  runBtn.disabled = true;
  stopBtn.disabled = false;
  logsEl.innerHTML = '';
  appendLog('Submitting job...');

  try {
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key, task })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start job');
    }
    const { job_id } = await res.json();
    appendLog(`Job started: ${job_id}`);

    if (evtSource) {
      evtSource.close();
      evtSource = null;
    }

    evtSource = new EventSource(`/logs/${job_id}`);
    evtSource.onmessage = (e) => {
      if (!e.data) return;
      appendLog(e.data);
      if (e.data === 'closed' || e.data.startsWith('error:')) {
        stopRun();
      }
    };
    evtSource.onerror = () => {
      appendLog('Connection error.');
      stopRun();
    };
  } catch (e) {
    appendLog(`Error: ${e.message}`);
    runBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function stopRun() {
  if (evtSource) {
    evtSource.close();
    evtSource = null;
  }
  runBtn.disabled = false;
  stopBtn.disabled = true;
}

runBtn.addEventListener('click', startRun);
stopBtn.addEventListener('click', stopRun);
