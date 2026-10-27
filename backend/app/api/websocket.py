"""
WebSocket Connection Manager.
Handles real-time bi-directional streaming and event broadcasting to connected frontend clients.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import logging

logger = logging.getLogger("aco.websocket")

class WebSocketHub:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcasts structured JSON event to all connected dashboard instances.
        """
        message = {
            "event": event_type,
            "data": data
        }
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending WebSocket message: {e}")
                dead_connections.append(connection)
                
        for dead in dead_connections:
            self.disconnect(dead)

# Global singleton hub
ws_hub = WebSocketHub()
