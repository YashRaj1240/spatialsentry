import re
import time
from typing import Dict, Any, List, Optional

def mock_transcribe_audio(audio_bytes: bytes) -> str:
    """Simulates Muse Voice Transcribe for voice commands or queries"""
    return "Did someone touch my laptop?"

def mock_segment_anything(image_bytes: bytes, target_label: str = None) -> List[Dict[str, Any]]:
    """Simulates SAM 3.1 zero-shot segmentation polygons and bounding boxes"""
    return [
        {
            "label": target_label or "protected_valuable",
            "confidence": 0.985,
            "bounding_box": [320, 180, 490, 390],
            "polygon": [
                [320, 185], [375, 180], [445, 182], [490, 220],
                [488, 385], [420, 390], [350, 385], [320, 310]
            ],
            "area_pixels": 14200,
            "center": [405, 285]
        }
    ]

def mock_sentinel_snatch_analysis(
    target_item: str = "Designer Leather Handbag",
    location: str = "Cafe Outdoor Table"
) -> Dict[str, Any]:
    """
    Simulates real-time threat perception by Meta SAM 3.1 & Llama 3:
    Detects sudden rapid displacement / snatching vector on a protected valuable item.
    """
    return {
        "threat_detected": True,
        "incident_type": "theft_attempt",
        "severity": "CRITICAL",
        "target_item": target_item,
        "location_context": location,
        "suspect_description": "Individual in dark sleeves, rapid right-hand grab from blind spot",
        "displacement_velocity": 4.6, # 4.6 m/s rapid snatch
        "bounding_box": [280, 160, 520, 410],
        "segmentation_polygon": [
            [280, 165], [360, 160], [450, 165], [520, 210],
            [515, 405], [430, 410], [340, 405], [280, 320]
        ],
        "frame_path": "sample_scenes/kitchen_counter.jpg",
        "evidence_thumbnail": "thumbnails/wallet.jpg",
        "ai_forensic_report": f"PERIMETER BREACH INTERCEPTED: High-velocity snatch vector detected on protected {target_item}. Suspect reached into perimeter while user was averted. 85dB Deterrent Siren triggered; evidence locked.",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
    }

def mock_muse_spark_reasoning(
    query: str,
    memories: List[Dict[str, Any]],
    incidents: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Simulates Muse Spark temporal, safety & spatial reasoning over the episodic sentinel graph"""
    words = [re.sub(r'[^\w]', '', w.lower()) for w in query.split()]
    stopwords = {"where", "what", "when", "which", "did", "have", "left", "leave", "find", "seen", "show", "tell", "about", "your", "mine", "this", "that", "there", "here", "with", "from", "someone"}
    query_keywords = [w for w in words if len(w) >= 3 and w not in stopwords]

    # Check incidents first (safety / theft related)
    if incidents:
        for inc in incidents:
            target = inc.get("target_item", "").lower()
            desc = inc.get("ai_forensic_report", "").lower()
            itype = inc.get("incident_type", "").lower()
            if any(kw in target or kw in desc or kw in itype for kw in query_keywords):
                return {
                    "found": True,
                    "is_incident": True,
                    "target_object": inc["target_item"],
                    "location_context": inc["location_context"],
                    "last_seen_timestamp": inc["timestamp"],
                    "confidence": 0.99,
                    "bounding_box": inc["bounding_box"],
                    "segmentation_polygon": inc["segmentation_polygon"],
                    "frame_path": inc["frame_path"],
                    "thumbnail_path": inc["evidence_thumbnail"],
                    "explanation": f"⚠️ SAFETY ALERT RECORDED: {inc['ai_forensic_report']}"
                }

    # Otherwise check ambient memories
    matched = None
    best_score = 0
    for mem in memories:
        name = mem.get("object_name", "").lower()
        cat = mem.get("category", "").lower()
        context = mem.get("room_context", "").lower()
        score = sum(1 for kw in query_keywords if kw in name) * 3 + \
                sum(1 for kw in query_keywords if kw in cat) * 2 + \
                sum(1 for kw in query_keywords if kw in context)
        if score > best_score:
            best_score = score
            matched = mem

    if not matched and memories:
        matched = memories[0]

    if matched:
        return {
            "found": True,
            "is_incident": False,
            "target_object": matched["object_name"],
            "location_context": matched["room_context"],
            "last_seen_timestamp": matched["timestamp"],
            "confidence": matched["confidence"],
            "bounding_box": matched["bounding_box"],
            "segmentation_polygon": matched["segmentation_polygon"],
            "frame_path": matched["frame_path"],
            "thumbnail_path": matched["thumbnail_path"],
            "explanation": f"Ambient Sentinel Memory: Your {matched['object_name']} was verified at {matched['timestamp'][:16].replace('T', ' ')} in the {matched['room_context']}."
        }

    return {
        "found": False,
        "target_object": query,
        "explanation": f"I scanned your Sentinel timeline, but found no security incident or recent observation matching '{query}'."
    }
