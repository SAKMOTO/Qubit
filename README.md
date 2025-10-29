# Browser-Use Live Agent

A real-time browser automation tool that allows you to control a browser through natural language commands and see the results in real-time.

## Features

- Real-time browser interaction
- WebSocket-based communication
- Simple and intuitive web interface
- Supports multiple browser sessions
- Built with FastAPI and Playwright

## Prerequisites

- Python 3.8+
- Node.js (for frontend development, optional)
- Playwright browsers (will be installed automatically)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd browser-use
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Playwright browsers:
   ```bash
   playwright install
   ```

## Usage

1. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:8000/static/index.html
   ```

3. Click "Start Session" to create a new browser session
4. Enter a task in the input field and click "Execute Task"

## API Endpoints

- `GET /` - Health check endpoint
- `POST /start-session` - Start a new browser session
- `WS /ws/{session_id}` - WebSocket endpoint for real-time communication

## Development

### Frontend

The frontend is a simple HTML/JS application located in the `static` directory. You can modify the files there and they will be served automatically.

### Backend

The backend is built with FastAPI and uses Playwright for browser automation. The main application logic is in `main.py`.

## License

MIT