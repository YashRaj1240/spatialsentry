import re
import time
from typing import Dict, Any, List

def mock_transcribe_audio(audio_bytes: bytes) -> str:
    """Simulates Muse Voice Transcribe for sample audio or queries"""
    return "Where did I leave my car keys?"

def mock_segment_anything(image_bytes: bytes, target_label: str = None) -> List[Dict[str, Any]]:
    """Simulates SAM 3.1 zero-shot segmentation polygons and bounding boxes"""
    return [
        {
            "label": target_label or "car_keys",
            "confidence": 0.985,
            "bounding_box": [340, 210, 430, 310],
            "polygon": [
                [340, 210], [375, 205], [415, 212], [430, 245],
                [428, 295], [395, 310], [355, 305], [340, 260]
            ],
            "area_pixels": 7200,
            "center": [385, 257]
        }
    ]

def mock_muse_spark_reasoning(query: str, memories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Simulates Muse Spark temporal & spatial reasoning over the episodic memory graph"""
    # Extract clean words, removing punctuation
    words = [re.sub(r'[^\w]', '', w.lower()) for w in query.split()]
    stopwords = {"where", "what", "when", "which", "did", "have", "left", "leave", "find", "seen", "show", "tell", "about", "your", "mine", "this", "that", "there", "here", "with", "from"}
    query_keywords = [w for w in words if len(w) >= 3 and w not in stopwords]
    
    # Keyword-based matching over candidate memories
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
        matched = memories[0] # Fallback to most recent observation
        
    if matched:
        return {
            "found": True,
            "target_object": matched["object_name"],
            "location_context": matched["room_context"],
            "last_seen_timestamp": matched["timestamp"],
            "confidence": matched["confidence"],
            "bounding_box": matched["bounding_box"],
            "segmentation_polygon": matched["segmentation_polygon"],
            "frame_path": matched["frame_path"],
            "thumbnail_path": matched["thumbnail_path"],
            "explanation": f"Based on your visual memory sweep, your {matched['object_name']} was last observed at {matched['timestamp'][:16].replace('T', ' ')} in the {matched['room_context']}."
        }
        
    return {
        "found": False,
        "target_object": query,
        "explanation": f"I scanned your spatial memory timeline, but couldn't spot '{query}' in any recent keyframes."
    }
