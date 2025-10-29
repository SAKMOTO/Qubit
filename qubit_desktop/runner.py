from __future__ import annotations

from typing import Generator, Optional, Tuple

from browser_use import Agent, Browser, ChatBrowserUse


def run_task_stream(task: str, use_cloud: bool, headed: bool, channel: Optional[str]) -> Generator[Tuple[str, object, object], None, None]:
    browser = Browser(
        headless=not headed,
        channel=channel if channel else None,
        use_cloud=use_cloud,
    )
    llm = ChatBrowserUse()
    agent = Agent(task=task, llm=llm, browser=browser)

    yield ("log", "Starting agent", None)
    history = agent.run_sync()  # convenience sync wrapper

    for url in history.urls():
        yield ("log", f"visit: {url}", None)

    success = bool(history.is_successful())
    summary = history.final_result() or ""
    yield ("done", success, summary)


