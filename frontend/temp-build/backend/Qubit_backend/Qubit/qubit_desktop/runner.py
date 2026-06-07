from __future__ import annotations

import os
import re
import threading
import time
from queue import Queue, Empty
from typing import Generator, Optional, Tuple

from browser_use import Agent, Browser, ChatBrowserUse
from .redirector import ensure_server, set_latest_live_url


def run_task_stream(task: str, use_cloud: bool, headed: bool, channel: Optional[str]) -> Generator[Tuple[str, object, object], None, None]:
    browser = Browser(
        headless=not headed,
        channel=channel if channel else None,
        use_cloud=use_cloud,
        # Custom browser settings for Qubit branding
        args=[
            '--app-name=Qubit AI Browser',
            '--app-version=1.0.0',
            '--disable-default-apps',
            '--disable-extensions-except=',
            '--disable-plugins-discovery',
            '--disable-sync',
            '--disable-translate',
            '--disable-web-security',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Qubit-AI-Browser/1.0.0 Chrome/120.0.0.0 Safari/537.36'
        ]
    )
    llm = ChatBrowserUse()
    agent = Agent(task=task, llm=llm, browser=browser)

    yield ("log", "🚀 Qubit AI Browser - Starting agent", None)

    # Set custom window title and branding (best-effort)
    try:
        if not use_cloud and headed:
            yield ("log", "🎨 Setting Qubit branding...", None)
            # Optionally show local branding page before navigation in future
    except Exception as e:
        yield ("log", f"⚠️ Could not set custom branding: {e}", None)

    # Capture live cloud URL from logs and stream to GUI
    url_queue: Queue[str] = Queue()
    log_queue: Queue[str] = Queue()
    cloud_url_regex = re.compile(r"Live URL:\s*(https?://\S+)")

    import logging

    class _CloudUrlHandler(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            msg = record.getMessage()
            try:
                log_queue.put_nowait(msg)
            except Exception:
                pass
            m = cloud_url_regex.search(msg)
            if m:
                try:
                    url_queue.put_nowait(m.group(1))
                    # Update local redirect target immediately
                    set_latest_live_url(m.group(1))
                except Exception:
                    pass

    handler = _CloudUrlHandler(level=logging.INFO)
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)

    history_holder = {"history": None}
    done = threading.Event()

    def _run():
        try:
            history_holder["history"] = agent.run_sync()
        finally:
            done.set()

    # Start redirect server (stable local link)
    try:
        ensure_server()
    except Exception:
        pass

    t = threading.Thread(target=_run, daemon=True)
    t.start()

    # While agent runs, forward any discovered cloud live URL
    while not done.is_set():
        try:
            url = url_queue.get(timeout=0.25)
            yield ("cloud_url", url, None)
        except Empty:
            pass
        # forward log lines too
        try:
            msg = log_queue.get_nowait()
            yield ("log", msg, None)
        except Empty:
            pass

    # Clean up handler
    try:
        root_logger.removeHandler(handler)
    except Exception:
        pass

    history = history_holder["history"]

    for url in history.urls():
        yield ("log", f"visit: {url}", None)

    success = bool(history.is_successful())
    summary = history.final_result() or ""
    yield ("done", success, summary)


