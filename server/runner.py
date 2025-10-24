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

        await job.queue.put("status: running agent")
        history = await agent.run()

        await job.queue.put(f"result: {history}")
        await job.queue.put("status: done")
    except Exception as e:
        job.error = str(e)
        await job.queue.put(f"error: {e}")
    finally:
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
