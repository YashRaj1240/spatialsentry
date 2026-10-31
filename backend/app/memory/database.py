import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS spatial_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        object_name TEXT NOT NULL,
        category TEXT NOT NULL,
        room_context TEXT NOT NULL,
        confidence REAL NOT NULL,
        bounding_box TEXT NOT NULL,
        segmentation_polygon TEXT,
        thumbnail_path TEXT,
        frame_path TEXT,
        timestamp TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_obj_name ON spatial_memory(object_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON spatial_memory(timestamp);")
    conn.commit()
    conn.close()

def insert_memory(
    session_id: str,
    object_name: str,
    category: str,
    room_context: str,
    confidence: float,
    bounding_box: List[int],
    segmentation_polygon: Optional[List[List[int]]] = None,
    thumbnail_path: Optional[str] = None,
    frame_path: Optional[str] = None,
    timestamp: Optional[str] = None
) -> int:
    if timestamp is None:
        timestamp = datetime.now().isoformat()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO spatial_memory (
            session_id, object_name, category, room_context, confidence,
            bounding_box, segmentation_polygon, thumbnail_path, frame_path, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id,
        object_name.lower().strip(),
        category.lower().strip(),
        room_context,
        confidence,
        json.dumps(bounding_box),
        json.dumps(segmentation_polygon) if segmentation_polygon else None,
        thumbnail_path,
        frame_path,
        timestamp
    ))
    memory_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return memory_id

def get_all_memories(limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM spatial_memory ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    results = []
    for row in rows:
        item = dict(row)
        item["bounding_box"] = json.loads(item["bounding_box"]) if item["bounding_box"] else []
        item["segmentation_polygon"] = json.loads(item["segmentation_polygon"]) if item["segmentation_polygon"] else []
        results.append(item)
    conn.close()
    return results

def get_memory_by_id(memory_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM spatial_memory WHERE id = ?", (memory_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    item = dict(row)
    item["bounding_box"] = json.loads(item["bounding_box"]) if item["bounding_box"] else []
    item["segmentation_polygon"] = json.loads(item["segmentation_polygon"]) if item["segmentation_polygon"] else []
    return item

def search_memories_keyword(keyword: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    search_term = f"%{keyword.lower()}%"
    cursor.execute("""
        SELECT * FROM spatial_memory 
        WHERE object_name LIKE ? OR category LIKE ? OR room_context LIKE ?
        ORDER BY timestamp DESC
    """, (search_term, search_term, search_term))
    rows = cursor.fetchall()
    results = []
    for row in rows:
        item = dict(row)
        item["bounding_box"] = json.loads(item["bounding_box"]) if item["bounding_box"] else []
        item["segmentation_polygon"] = json.loads(item["segmentation_polygon"]) if item["segmentation_polygon"] else []
        results.append(item)
    conn.close()
    return results

def seed_default_memories():
    """Seeds realistic episodic memories for demonstration if empty"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM spatial_memory")
    count = cursor.fetchone()[0]
    conn.close()

    if count > 0:
        return

    now = datetime.now()
    demo_objects = [
        {
            "session_id": "demo_morning_sweep",
            "object_name": "car keys with black leather fob",
            "category": "personal_items",
            "room_context": "Kitchen counter, left of the stainless steel toaster",
            "confidence": 0.98,
            "bounding_box": [340, 210, 430, 310],
            "segmentation_polygon": [[340, 210], [420, 215], [430, 305], [345, 300]],
            "thumbnail_path": "thumbnails/keys.jpg",
            "frame_path": "sample_scenes/kitchen_counter.jpg",
            "timestamp": (now - timedelta(hours=2, minutes=14)).isoformat()
        },
        {
            "session_id": "demo_morning_sweep",
            "object_name": "leather wallet (brown bifold)",
            "category": "personal_items",
            "room_context": "Entryway console table, inside the ceramic catch-all bowl",
            "confidence": 0.96,
            "bounding_box": [180, 290, 290, 390],
            "segmentation_polygon": [[185, 295], [285, 290], [290, 385], [180, 380]],
            "thumbnail_path": "thumbnails/wallet.jpg",
            "frame_path": "sample_scenes/entryway.jpg",
            "timestamp": (now - timedelta(hours=4, minutes=30)).isoformat()
        },
        {
            "session_id": "demo_office_sweep",
            "object_name": "blue wireless airpods pro case",
            "category": "electronics",
            "room_context": "Home office desk, sitting directly on top of the black notebook",
            "confidence": 0.99,
            "bounding_box": [450, 180, 520, 240],
            "segmentation_polygon": [[455, 182], [518, 180], [516, 238], [452, 236]],
            "thumbnail_path": "thumbnails/airpods.jpg",
            "frame_path": "sample_scenes/office_desk.jpg",
            "timestamp": (now - timedelta(hours=1, minutes=5)).isoformat()
        },
        {
            "session_id": "demo_office_sweep",
            "object_name": "reading glasses with tortoiseshell frame",
            "category": "personal_items",
            "room_context": "Living room coffee table, next to the ceramic coffee mug",
            "confidence": 0.94,
            "bounding_box": [260, 320, 370, 380],
            "segmentation_polygon": [[262, 325], [365, 320], [368, 375], [260, 378]],
            "thumbnail_path": "thumbnails/glasses.jpg",
            "frame_path": "sample_scenes/living_room.jpg",
            "timestamp": (now - timedelta(hours=3, minutes=12)).isoformat()
        },
        {
            "session_id": "demo_garage_sweep",
            "object_name": "phillips magnetic screwdriver (yellow handle)",
            "category": "tools",
            "room_context": "Garage workbench, resting on the blue shop towel",
            "confidence": 0.97,
            "bounding_box": [510, 140, 640, 220],
            "segmentation_polygon": [[515, 145], [635, 140], [638, 215], [512, 218]],
            "thumbnail_path": "thumbnails/screwdriver.jpg",
            "frame_path": "sample_scenes/garage_bench.jpg",
            "timestamp": (now - timedelta(minutes=45)).isoformat()
        }
    ]

    for obj in demo_objects:
        insert_memory(**obj)
