import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

from app.config import DATA_DIR, MOCK_MODE, META_MODEL_API_KEY
from app.memory.database import init_db, seed_default_memories, get_all_memories, get_connection
from app.memory.tracker import process_keyframe
from app.memory.query_engine import answer_spatial_query
from app.models.meta_client import meta_client

app = FastAPI(
    title="SpatialRecall API",
    description="Episodic Spatial-Temporal Memory Engine for Wearables & Smart Glasses powered by Meta SAM 3.1 and Muse",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Thumbnails & Scenes
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

@app.on_event("startup")
def on_startup():
    init_db()
    seed_default_memories()

@app.get("/api/health")
def health_check():
    # Calculate total database & thumbnail storage size in KB
    total_bytes = 0
    for root, _, files in os.walk(DATA_DIR):
        for f in files:
            fp = os.path.join(root, f)
            if os.path.exists(fp):
                total_bytes += os.path.getsize(fp)

    storage_kb = round(total_bytes / 1024, 2)

    return {
        "status": "healthy",
        "service": "SpatialRecall",
        "mode": "Simulation (Pre-Key)" if MOCK_MODE else "Live (Meta Model API)",
        "has_api_key": bool(META_MODEL_API_KEY),
        "models": {
            "spatial_segmentation": "Meta SAM 3.1",
            "voice_transcription": "Meta Muse Voice Transcribe",
            "temporal_reasoning": "Meta Muse Spark"
        },
        "storage_metrics": {
            "total_storage_kb": storage_kb,
            "efficiency_rating": "Ultra-Low Power Edge Profile (<15MB/day)"
        }
    }

class TextQueryRequest(BaseModel):
    query: str

@app.post("/api/query-text")
async def query_by_text(req: TextQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    result = await answer_spatial_query(req.query)
    return result

@app.post("/api/query-voice")
async def query_by_voice(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    transcribed_text = await meta_client.transcribe_audio(audio_bytes, filename=audio.filename or "voice.wav")
    
    if not transcribed_text:
        return {
            "found": False,
            "transcription": "",
            "explanation": "Could not capture clear audio from the microphone."
        }

    reasoning_result = await answer_spatial_query(transcribed_text)
    reasoning_result["transcription"] = transcribed_text
    return reasoning_result

@app.post("/api/ingest-frame")
async def ingest_frame(
    frame: UploadFile = File(...),
    session_id: str = Form("session_live"),
    room_context: str = Form("Home Office"),
    target_hint: Optional[str] = Form(None)
):
    frame_bytes = await frame.read()
    result = await process_keyframe(
        image_bytes=frame_bytes,
        session_id=session_id,
        room_context=room_context,
        target_hint=target_hint
    )
    return result

@app.get("/api/timeline")
def get_timeline():
    memories = get_all_memories(limit=50)
    return {
        "count": len(memories),
        "memories": memories
    }

@app.get("/api/stats")
def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), COUNT(DISTINCT category), COUNT(DISTINCT room_context) FROM spatial_memory")
    row = cursor.fetchone()
    total_objects, total_categories, total_rooms = row[0], row[1], row[2]
    conn.close()

    total_bytes = sum(
        os.path.getsize(os.path.join(root, f))
        for root, _, files in os.walk(DATA_DIR)
        for f in files
    )

    return {
        "tracked_objects_count": total_objects,
        "active_rooms_count": total_rooms,
        "categories_count": total_categories,
        "total_storage_kb": round(total_bytes / 1024, 2),
        "target_hardware": "Meta Ray-Ban Smart Glasses"
    }
