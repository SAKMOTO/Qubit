"""
Browser Manager for Cloud Browser Integration
Handles cloud browser sessions and live view URLs
"""

import os
from typing import Optional, Dict
import httpx
from dotenv import load_dotenv

load_dotenv()


class CloudBrowserManager:
    """Manages cloud browser sessions for live viewing"""
    
    def __init__(self):
        self.api_key = os.getenv("BROWSER_USE_API_KEY")
        self.base_url = os.getenv("BROWSER_USE_API_URL", "https://api.browser-use.cloud/v1")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def start_session(self, task: str, config: Optional[Dict] = None) -> Dict:
        """
        Start a new cloud browser session
        
        Args:
            task: The task description for the browser agent
            config: Optional configuration for the browser session
            
        Returns:
            Dict containing session_id, viewer_url, and other session info
        """
        payload = {
            "task": task,
            "config": config or {}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/sessions",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Error starting session: {e}")
                return {
                    "error": str(e),
                    "session_id": None,
                    "viewer_url": None
                }
    
    async def get_session_status(self, session_id: str) -> Dict:
        """
        Get the current status of a browser session
        
        Args:
            session_id: The unique session identifier
            
        Returns:
            Dict containing session status and details
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/sessions/{session_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Error getting session status: {e}")
                return {
                    "error": str(e),
                    "status": "unknown"
                }
    
    async def get_viewer_url(self, session_id: str) -> Optional[str]:
        """
        Get the live viewer URL for a session
        
        Args:
            session_id: The unique session identifier
            
        Returns:
            The viewer URL or None if not available
        """
        status = await self.get_session_status(session_id)
        return status.get("viewer_url")
    
    async def stop_session(self, session_id: str) -> bool:
        """
        Stop and cleanup a browser session
        
        Args:
            session_id: The unique session identifier
            
        Returns:
            True if successful, False otherwise
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    f"{self.base_url}/sessions/{session_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                return response.status_code in [200, 204]
            except httpx.HTTPError as e:
                print(f"Error stopping session: {e}")
                return False
    
    async def get_screenshot(self, session_id: str) -> Optional[bytes]:
        """
        Get a screenshot from the browser session
        
        Args:
            session_id: The unique session identifier
            
        Returns:
            Screenshot bytes or None if not available
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/sessions/{session_id}/screenshot",
                    headers=self.headers,
                    timeout=15.0
                )
                response.raise_for_status()
                return response.content
            except httpx.HTTPError as e:
                print(f"Error getting screenshot: {e}")
                return None
    
    async def send_command(self, session_id: str, command: str) -> Dict:
        """
        Send a command to the browser session
        
        Args:
            session_id: The unique session identifier
            command: The command to execute
            
        Returns:
            Dict containing command result
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/sessions/{session_id}/command",
                    json={"command": command},
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Error sending command: {e}")
                return {
                    "error": str(e),
                    "success": False
                }


# Singleton instance
_browser_manager = None


def get_browser_manager() -> CloudBrowserManager:
    """Get or create the browser manager singleton"""
    global _browser_manager
    if _browser_manager is None:
        _browser_manager = CloudBrowserManager()
    return _browser_manager
