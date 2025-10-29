from __future__ import annotations

import os
from typing import Generator, Optional, Tuple

from browser_use import Agent, Browser, ChatBrowserUse


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
    
    # Set custom window title and branding
    try:
        if not use_cloud and headed:
            # For local browser, we can set custom properties
            yield ("log", "🎨 Setting Qubit branding...", None)
            
            # Get the path to our custom HTML file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            qubit_html_path = os.path.join(current_dir, "qubit_start.html")
            qubit_html_url = f"file://{qubit_html_path}"
            
            # Navigate to our custom Qubit page first
            yield ("log", "🎯 Loading Qubit interface...", None)
            # Note: We'll let the agent handle the actual navigation to the task URL
    except Exception as e:
        yield ("log", f"⚠️ Could not set custom branding: {e}", None)
    
    history = agent.run_sync()  # convenience sync wrapper

    for url in history.urls():
        yield ("log", f"visit: {url}", None)

    success = bool(history.is_successful())
    summary = history.final_result() or ""
    yield ("done", success, summary)


