
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mother_brain import MotherBrain
from core.status_broadcaster import broadcaster
import uvicorn
import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Mother Brain (Global Instance)
mother = MotherBrain()

# Data Models
class UserRequest(BaseModel):
    message: str
    agent_name: str = "Mother"  # Default to Mother if not specified

@app.get("/")
def read_root():
    return {"status": "Mother AI System Online", "type": "Python/Docker Backend"}

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)

@app.post("/api/chat")
async def chat_endpoint(request: UserRequest):
    """
    Receives chat messages from the frontend and sends them to Mother Brain.
    """
    # Define callback to stream logs/thoughts to frontend
    async def log_callback(msg: str):
         await broadcaster.broadcast_log(msg)

    response = await mother.process_task(request.message, request.agent_name, log_callback)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
