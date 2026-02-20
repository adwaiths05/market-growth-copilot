# app/services/stream_service.py
import json
from typing import Dict, List
from fastapi import WebSocket

class StreamManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, job_id: str, websocket: WebSocket):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)

    async def broadcast_status(self, job_id: str, message: dict):
        """Broadcasts status updates (existing)."""
        if job_id in self.active_connections:
            for connection in self.active_connections[job_id]:
                await connection.send_json({"type": "status", "data": message})

    async def broadcast_token(self, job_id: str, token: str):
        """
        New: Broadcasts individual tokens for real-time text generation UI.
        """
        if job_id in self.active_connections:
            for connection in self.active_connections[job_id]:
                await connection.send_json({"type": "token", "token": token})

stream_manager = StreamManager()