import asyncio
import os
import uuid
from typing import AsyncGenerator, Dict, Optional

from browser_use import Agent, Browser, ChatBrowserUse


class Job:
    def __init__(self, job_id: str):
        self.id = job_id
        self.queue: asyncio.Queue[str] = asyncio.Queue()
        self.done: asyncio.Event = asyncio.Event()
        self.error: Optional[str] = None


_jobs: Dict[str, Job] = {}
_playwright_ready = asyncio.Lock()
_playwright_initialized = False


async def _capture_screenshots(job: Job, stop_event: asyncio.Event):
    """Continuously capture the X display and stream as base64 PNG over SSE."""
    # Only works if an X display is present (e.g., DISPLAY=:0)
    while not stop_event.is_set():
        try:
            # Capture root window via xwd and convert to PNG
            proc1 = await asyncio.create_subprocess_exec(
                "xwd", "-root", "-silent",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL,
            )
            proc2 = await asyncio.create_subprocess_exec(
                "convert", "xwd:-", "png:-",
                stdin=proc1.stdout,  # type: ignore[arg-type]
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL,
            )
            # Ensure proc1 completes to avoid zombies
            if proc1.stdout:
                proc1.stdout.close()
            img_bytes, _ = await proc2.communicate()
            # Base64 encode
            if img_bytes:
                import base64
                b64 = base64.b64encode(img_bytes).decode("ascii")
                await job.queue.put(f"image: data:image/png;base64,{b64}")
        except Exception:
            # Ignore errors; try again next tick
            pass
        await asyncio.sleep(2.0)


async def ensure_playwright_chromium_installed():
    global _playwright_initialized
    if _playwright_initialized:
        return
    async with _playwright_ready:
        if _playwright_initialized:
            return
        proc = await asyncio.create_subprocess_exec(
            os.sys.executable,
            "-m",
            "playwright",
            "install",
            "chromium",
            "--with-deps",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        await proc.communicate()
        _playwright_initialized = True


async def run_agent(job: Job, api_key: str, task: str):
    try:
        await job.queue.put("status: initializing")
        old_key = os.environ.get("BROWSER_USE_API_KEY")
        os.environ["BROWSER_USE_API_KEY"] = api_key

        use_cloud = os.getenv("USE_CLOUD_BROWSER", "0") == "1"
        if not use_cloud:
            await ensure_playwright_chromium_installed()
        await job.queue.put("status: launching browser")

        browser = Browser(
            # Use Browser Use Cloud in constrained hosts (e.g., Render) to avoid local Chromium issues
            use_cloud=use_cloud,
        )
        llm = ChatBrowserUse()
        agent = Agent(task=task, llm=llm, browser=browser)

        # Start optional screenshot streamer if running local headful
        screenshot_task: asyncio.Task | None = None
        stop_event = asyncio.Event()
        stream_shots = os.getenv("STREAM_SCREENSHOTS", "1") == "1"
        if stream_shots and not use_cloud:
            screenshot_task = asyncio.create_task(_capture_screenshots(job, stop_event))

        await job.queue.put("status: running agent")
        history = await agent.run()

        await job.queue.put(f"result: {history}")
        await job.queue.put("status: done")
    except Exception as e:
        job.error = str(e)
        await job.queue.put(f"error: {e}")
    finally:
        # Stop screenshot streamer
        try:
            stop_event.set()
            if 'screenshot_task' in locals() and screenshot_task is not None:
                await asyncio.wait_for(screenshot_task, timeout=2.0)
        except Exception:
            pass
        if old_key is not None:
            os.environ["BROWSER_USE_API_KEY"] = old_key
        else:
            os.environ.pop("BROWSER_USE_API_KEY", None)
        job.done.set()


def start_job(api_key: str, task: str) -> str:
    job_id = uuid.uuid4().hex
    job = Job(job_id)
    _jobs[job_id] = job
    asyncio.create_task(run_agent(job, api_key, task))
    return job_id


async def stream_logs(job_id: str) -> AsyncGenerator[str, None]:
    job = _jobs.get(job_id)
    if not job:
        yield "data: error: job not found\n\n"
        return

    while True:
        try:
            msg = await asyncio.wait_for(job.queue.get(), timeout=0.5)
            yield f"data: {msg}\n\n"
        except asyncio.TimeoutError:
            if job.done.is_set() and job.queue.empty():
                break
            continue

    if job.error:
        yield f"data: error: {job.error}\n\n"
    else:
        yield "data: closed\n\n"


def job_status(job_id: str) -> Dict[str, str]:
    job = _jobs.get(job_id)
    if not job:
        return {"status": "not_found"}
    if job.error:
        return {"status": "error", "error": job.error}
    if job.done.is_set():
        return {"status": "done"}
    return {"status": "running"}
