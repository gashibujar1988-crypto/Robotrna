
import json
import asyncio
from fastapi import WebSocket

class StatusBroadcaster:
    """
    Manages real-time status updates to the frontend dashboard.
    """
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[StatusBroadcaster] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"[StatusBroadcaster] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast_log(self, message: str, level: str = "INFO"):
        """Sends a text log to the console."""
        payload = {
            "type": "log",
            "message": message,
            "level": level
        }
        await self._send_all(payload)

    async def broadcast_agent_status(self, agent_name: str, status: str):
        """
        Updates the visual state of an agent card.
        Status: 'IDLE', 'THINKING', 'WORKING', 'ERROR', 'SUCCESS'
        """
        payload = {
            "type": "agent_status",
            "agent": agent_name,
            "status": status
        }
        await self._send_all(payload)

    async def _send_all(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception as e:
                print(f"Error broadcasting: {e}")
                # We might want to remove dead connections here, but disconnect() handles it usually

# Singleton instance to be used across the app
broadcaster = StatusBroadcaster()
