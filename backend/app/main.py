import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.config import DATA_DIR, MOCK_MODE, META_MODEL_API_KEY
from app.memory.database import (
    init_db, seed_default_sentinel_data, get_all_incidents,
    get_all_memories, get_connection
)
from app.sentinel.sentinel_engine import sentinel_engine
from app.models.mock_engine import mock_muse_spark_reasoning
from app.models.meta_client import meta_client

app = FastAPI(
    title="AegisAI Sentinel API",
    description="24/7 Ephemeral AI Bodyguard & Anti-Theft Sentinel powered by Meta SAM 3.1 & Muse",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Thumbnails & Scenes & Incidents
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

@app.on_event("startup")
def on_startup():
    init_db()
    seed_default_sentinel_data()

@app.get("/api/health")
def health_check():
    # Calculate storage footprint
    total_bytes = 0
    for root, _, files in os.walk(DATA_DIR):
        for f in files:
            fp = os.path.join(root, f)
            if os.path.exists(fp):
                total_bytes += os.path.getsize(fp)

    return {
        "status": "active",
        "service": "AegisAI - 24/7 AI Bodyguard & Sentinel",
        "mode": "Simulation (Pre-Key)" if MOCK_MODE else "Live (Meta Model API)",
        "models": {
            "threat_segmentation": "Meta SAM 3.1",
            "voice_sos": "Meta Muse Voice Transcribe",
            "forensic_reasoning": "Meta Muse Spark & Llama 3"
        },
        "ephemeral_buffer": sentinel_engine.get_buffer_stats(),
        "storage_metrics": {
            "total_storage_kb": round(total_bytes / 1024, 2),
            "privacy_architecture": "10-Second In-Memory Rolling Buffer (Continuous Discard)"
        }
    }

@app.get("/api/sentinel/status")
def get_sentinel_status():
    return sentinel_engine.get_buffer_stats()

@app.post("/api/sentinel/toggle-arm")
def toggle_arm():
    sentinel_engine.is_armed = not sentinel_engine.is_armed
    return {
        "is_armed": sentinel_engine.is_armed,
        "status_label": "ARMED (Active Perimeter Guard)" if sentinel_engine.is_armed else "STANDBY (Disarmed)"
    }

class TriggerSnatchRequest(BaseModel):
    target_item: str = "Designer Leather Handbag"
    location: str = "Coffee Shop Outdoor Table"

@app.post("/api/sentinel/trigger-snatch")
def trigger_snatch(req: TriggerSnatchRequest):
    """Simulates high-velocity theft snatch attempt intercepted by Meta SAM 3.1"""
    alert = sentinel_engine.trigger_theft_intercept(
        target_item=req.target_item,
        location=req.location
    )
    return alert

@app.get("/api/sentinel/incidents")
def get_incidents():
    incidents = get_all_incidents(limit=20)
    return {
        "count": len(incidents),
        "incidents": incidents
    }

class TextQueryRequest(BaseModel):
    query: str

@app.post("/api/query-text")
async def query_text(req: TextQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    incidents = get_all_incidents(limit=20)
    memories = get_all_memories(limit=20)
    
    result = mock_muse_spark_reasoning(req.query, memories=memories, incidents=incidents)
    return result

@app.post("/api/ingest-frame")
async def ingest_frame(
    frame: UploadFile = File(...),
    room_context: str = Form("Active Desk Area"),
    target_hint: Optional[str] = Form(None),
    is_snatch_event: bool = Form(False)
):
    frame_bytes = await frame.read()
    
    # Add to rolling RAM buffer
    sentinel_engine.add_frame(frame_bytes, metadata={"location": room_context, "hint": target_hint})
    
    # If snatch trigger or hint indicates theft
    if is_snatch_event or (target_hint and "theft" in target_hint.lower()):
        alert = sentinel_engine.trigger_theft_intercept(
            target_item=target_hint or "Protected Valuable",
            location=room_context,
            frame_bytes=frame_bytes
        )
        return {
            "threat_detected": True,
            "alarm_active": True,
            "message": "THEFT INTERCEPTED! Siren triggered & incident frozen into evidence vault.",
            "alert": alert
        }

    # Normal ambient frame: in-memory rotation
    buffer_stats = sentinel_engine.get_buffer_stats()
    return {
        "threat_detected": False,
        "alarm_active": False,
        "message": "Frame processed in RAM rolling buffer. Raw frame auto-purged.",
        "buffer_stats": buffer_stats
    }

@app.get("/api/timeline")
def get_timeline():
    memories = get_all_memories(limit=50)
    return {
        "count": len(memories),
        "memories": memories
    }

@app.get("/api/stats")
def get_stats():
    incidents = get_all_incidents(limit=50)
    memories = get_all_memories(limit=50)
    total_bytes = sum(
        os.path.getsize(os.path.join(root, f))
        for root, _, files in os.walk(DATA_DIR)
        for f in files
    )

    return {
        "incidents_intercepted": len(incidents),
        "ambient_memories": len(memories),
        "active_buffer": sentinel_engine.get_buffer_stats(),
        "total_storage_kb": round(total_bytes / 1024, 2)
    }
