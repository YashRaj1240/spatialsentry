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
    
    # 1. Incidents Ledger (Frozen evidence from ephemeral RAM buffer)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        target_item TEXT NOT NULL,
        location_context TEXT NOT NULL,
        suspect_description TEXT,
        displacement_velocity REAL,
        bounding_box TEXT NOT NULL,
        segmentation_polygon TEXT,
        frame_path TEXT,
        evidence_thumbnail TEXT,
        ai_forensic_report TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Ambient Physical Memory (For ambient peace-of-mind checks)
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

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_incident_time ON incidents(timestamp);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_obj_name ON spatial_memory(object_name);")
    conn.commit()
    conn.close()

def insert_incident(
    incident_type: str,
    severity: str,
    target_item: str,
    location_context: str,
    bounding_box: List[int],
    ai_forensic_report: str,
    suspect_description: Optional[str] = None,
    displacement_velocity: float = 1.0,
    segmentation_polygon: Optional[List[List[int]]] = None,
    frame_path: Optional[str] = None,
    evidence_thumbnail: Optional[str] = None,
    timestamp: Optional[str] = None
) -> int:
    if timestamp is None:
        timestamp = datetime.now().isoformat()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO incidents (
            incident_type, severity, target_item, location_context,
            suspect_description, displacement_velocity, bounding_box,
            segmentation_polygon, frame_path, evidence_thumbnail,
            ai_forensic_report, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_type,
        severity,
        target_item,
        location_context,
        suspect_description,
        displacement_velocity,
        json.dumps(bounding_box),
        json.dumps(segmentation_polygon) if segmentation_polygon else None,
        frame_path,
        evidence_thumbnail,
        ai_forensic_report,
        timestamp
    ))
    incident_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return incident_id

def get_all_incidents(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    results = []
    for row in rows:
        item = dict(row)
        item["bounding_box"] = json.loads(item["bounding_box"]) if item["bounding_box"] else []
        item["segmentation_polygon"] = json.loads(item["segmentation_polygon"]) if item["segmentation_polygon"] else []
        results.append(item)
    conn.close()
    return results

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

def seed_default_sentinel_data():
    """Seeds realistic default incidents and memories for live demonstration"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM incidents")
    incident_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM spatial_memory")
    memory_count = cursor.fetchone()[0]
    conn.close()

    now = datetime.now()

    if incident_count == 0:
        demo_incidents = [
            {
                "incident_type": "theft_attempt",
                "severity": "CRITICAL",
                "target_item": "Brown Leather Handbag",
                "location_context": "Coffee Shop Table (Outdoor Patio, 4th & Pine)",
                "suspect_description": "Suspect in grey jacket & white sneakers, rapid right-hand grab",
                "displacement_velocity": 4.8,
                "bounding_box": [320, 180, 490, 390],
                "segmentation_polygon": [[320, 185], [480, 180], [490, 385], [325, 390]],
                "frame_path": "sample_scenes/cafe_theft_intercept.jpg",
                "evidence_thumbnail": "thumbnails/wallet.jpg",
                "ai_forensic_report": "PERIMETER BREACH INTERCEPTED: High-velocity snatch vector detected on protected handbag while user gaze was averted. Audible deterrent siren triggered at 85dB. Suspect aborted grab and fled eastward on foot.",
                "timestamp": (now - timedelta(minutes=24)).isoformat()
            },
            {
                "incident_type": "pocket_extraction_breach",
                "severity": "CRITICAL",
                "target_item": "iPhone 15 Pro (Titanium Black)",
                "location_context": "Metro Station Escalator (Crowded Transit)",
                "suspect_description": "Unidentified individual extracted device from coat pocket in crowded crowd",
                "displacement_velocity": 3.2,
                "bounding_box": [220, 240, 510, 420],
                "segmentation_polygon": [[225, 245], [505, 240], [510, 415], [220, 418]],
                "frame_path": "sample_scenes/office_desk.jpg",
                "evidence_thumbnail": "thumbnails/airpods.jpg",
                "ai_forensic_report": "POCKET EXTRACTION DETECTED: Device transitioned from 0 lux darkness to ambient light with 1.8g lift while owner was stationary. Extraction Chime sounded and suspect evidence locked.",
                "timestamp": (now - timedelta(hours=1, minutes=15)).isoformat()
            }
        ]
        for inc in demo_incidents:
            insert_incident(**inc)

    if memory_count == 0:
        demo_memories = [
            {
                "session_id": "ambient_sentinel_morning",
                "object_name": "wireless earbuds (AirPods)",
                "category": "personal_items",
                "room_context": "Work desk table, resting right on the surface",
                "confidence": 0.99,
                "bounding_box": [280, 210, 420, 340],
                "segmentation_polygon": [[280, 215], [410, 210], [420, 335], [285, 340]],
                "thumbnail_path": "thumbnails/airpods.jpg",
                "frame_path": "sample_scenes/office_desk.jpg",
                "timestamp": (now - timedelta(minutes=15)).isoformat()
            },
            {
                "session_id": "ambient_sentinel_morning",
                "object_name": "apartment keys with carbon fob",
                "category": "personal_items",
                "room_context": "Kitchen island, resting beside the ceramic bowl",
                "confidence": 0.99,
                "bounding_box": [340, 210, 430, 310],
                "segmentation_polygon": [[340, 210], [420, 215], [430, 305], [345, 300]],
                "thumbnail_path": "thumbnails/keys.jpg",
                "frame_path": "sample_scenes/kitchen_counter.jpg",
                "timestamp": (now - timedelta(hours=3, minutes=10)).isoformat()
            },
            {
                "session_id": "ambient_sentinel_morning",
                "object_name": "clothing iron and power cord",
                "category": "home_safety",
                "room_context": "Laundry room board, unplugged and set upright",
                "confidence": 0.98,
                "bounding_box": [180, 290, 290, 390],
                "segmentation_polygon": [[185, 295], [285, 290], [290, 385], [180, 380]],
                "thumbnail_path": "thumbnails/wallet.jpg",
                "frame_path": "sample_scenes/entryway.jpg",
                "timestamp": (now - timedelta(hours=4, minutes=5)).isoformat()
            }
        ]
        for mem in demo_memories:
            insert_memory(**mem)
