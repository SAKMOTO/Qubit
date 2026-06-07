from __future__ import annotations

import threading
from typing import Optional

from fastapi import FastAPI
from fastapi.responses import RedirectResponse, PlainTextResponse
import uvicorn


_latest_url: Optional[str] = None
_server_started = False
_lock = threading.Lock()


def set_latest_live_url(url: Optional[str]) -> None:
    global _latest_url
    with _lock:
        _latest_url = url


def get_latest_live_url() -> Optional[str]:
    with _lock:
        return _latest_url


def _create_app() -> FastAPI:
    app = FastAPI()

    @app.get("/live")
    def live() -> RedirectResponse | PlainTextResponse:
        url = get_latest_live_url()
        if not url:
            return PlainTextResponse("No active cloud session.", status_code=404)
        return RedirectResponse(url=url, status_code=302)

    @app.get("/")
    def root() -> str:
        return "Qubit Redirector OK"

    return app


def ensure_server(host: str = "127.0.0.1", port: int = 8787) -> None:
    global _server_started
    if _server_started:
        return
    _server_started = True

    def _run():
        app = _create_app()
        uvicorn.run(app, host=host, port=port, log_level="warning")

    t = threading.Thread(target=_run, daemon=True)
    t.start()


