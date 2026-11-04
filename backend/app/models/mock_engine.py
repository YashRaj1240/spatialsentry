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

SYNONYM_GROUPS = {
    "mouse": ["mouse", "computer mouse", "wireless mouse", "bluetooth mouse", "magic mouse", "trackpad", "pointer"],
    "charger": ["charger", "phone charger", "charging cable", "cable", "adapter", "power cord", "wire", "usb cable", "plug"],
    "earbuds": ["earbuds", "earbud", "airpods", "airpod", "headphones", "headphone", "buds", "earphones", "earphone", "audio", "pods"],
    "keys": ["keys", "key", "fob", "keychain", "car keys", "apartment keys", "carbon fob"],
    "phone": ["phone", "smartphone", "iphone", "mobile", "device", "handset", "cellphone", "android"],
    "wallet": ["wallet", "purse", "cardholder", "cards", "money", "cash"],
    "laptop": ["laptop", "computer", "macbook", "pc", "notebook", "screen", "keyboard"],
    "iron": ["iron", "clothing iron", "flat iron", "unplugged iron"],
    "handbag": ["handbag", "bag", "backpack", "tote", "purse"],
    "glasses": ["glasses", "spectacles", "sunglasses", "shades", "reading glasses"],
    "bottle": ["bottle", "water bottle", "flask", "thermos", "tumbler", "sipper"],
    "cup": ["cup", "mug", "coffee mug", "glass", "teacup"],
    "watch": ["watch", "smartwatch", "apple watch", "timepiece"],
    "book": ["book", "notebook", "diary", "journal", "pad"],
    "pen": ["pen", "pencil", "marker", "stylus"]
}

def extract_target_object(raw_query: str) -> str:
    """Extracts canonical object name, stripping conversational fillers and questions"""
    lower = raw_query.lower().strip()
    for group_key, words in SYNONYM_GROUPS.items():
        for w in words:
            if re.search(rf"\b{re.escape(w)}\b", lower):
                return group_key
    
    # Strip conversational noise
    cleaned = re.sub(r'^(hey|hi|hello|ok|okay|sentry)\b', '', lower)
    cleaned = re.sub(r'^(do\s+you\s+know|you\s+know|can\s+you\s+tell\s+me|tell\s+me|please\s+tell\s+me|could\s+you\s+tell\s+me|do\s+you\s+remember|can\s+you\s+find|find|search\s+for|look\s+for|have\s+you\s+seen|did\s+you\s+see)\b', '', cleaned)
    cleaned = re.sub(r'\b(where\s+(is|are|was|were|did\s+i\s+(leave|put|keep)|did\s+someone\s+take))\b', '', cleaned)
    cleaned = re.sub(r'\b(i\s+am\s+not\s+able\s+to\s+remember|i\s+cannot\s+remember|i\s+can\'t\s+remember|i\s+forgot|i\s+am\s+forgetting|not\s+able\s+to\s+remember|cant\s+remember)\b', '', cleaned)
    cleaned = re.sub(r'\b(my|the|a|an|any|some|you\s+know|please|now|today|earlier)\b', '', cleaned)
    cleaned = re.sub(r'[?!.,]', '', cleaned).strip()
    return cleaned or "item"

def expand_query_keywords(keywords: List[str]) -> set:
    expanded = set(keywords)
    for kw in keywords:
        for group_key, synonyms in SYNONYM_GROUPS.items():
            if kw == group_key or kw in synonyms or group_key in kw:
                expanded.update(synonyms)
    return expanded

TARA_CLOSING_PHRASES = [
    "no, that's all", "no that's all", "no thats all", "that's all", "thats all",
    "that is all", "i'm good", "im good", "nothing else", "that's it", "thats it",
    "no, thank you", "no thank you", "no thanks", "i'm done", "im done", "all good",
    "no questions", "no question", "nothing", "nevermind", "never mind", "stop", "bye", "goodbye"
]

def mock_muse_spark_reasoning(
    query: str,
    memories: List[Dict[str, Any]],
    incidents: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """TARA Persona Spatial Reasoning & Goal Completion Engine"""
    lower_q = query.lower().strip()

    # Check if this is an explicit or indirect closing response (Case B & C)
    is_closing = any(p in lower_q for p in TARA_CLOSING_PHRASES) or lower_q in ["no", "nope", "thanks", "thank you"]
    
    # Check if user is asking for another object in the same turn (Case D)
    has_new_object_request = any(re.search(rf"\b{re.escape(w)}\b", lower_q) for w in ["where", "find", "check", "see", "what about", "glasses", "wallet", "keys", "mouse", "charger", "phone"])

    if is_closing and not has_new_object_request:
        return {
            "found": True,
            "is_closure": True,
            "target_object": "TARA Sentinel",
            "location_context": "Goal Completed",
            "confidence": 1.0,
            "explanation": "Alright! Glad I could help. Just call me whenever you need to find something. Have a great day!"
        }

    target_clean = extract_target_object(query)
    words = [re.sub(r'[^\w]', '', w.lower()) for w in query.split()]
    stopwords = {
        "where", "what", "when", "which", "did", "have", "left", "leave", "find", 
        "seen", "show", "tell", "about", "your", "mine", "this", "that", "there", 
        "here", "with", "from", "someone", "the", "are", "is", "my", "you", "know", 
        "remember", "able", "not", "cant", "cannot", "please", "can", "could", "would"
    }
    raw_keywords = [w for w in words if len(w) >= 3 and w not in stopwords]
    if target_clean and target_clean not in raw_keywords:
        raw_keywords.append(target_clean)
    query_keywords = expand_query_keywords(raw_keywords)

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
                    "explanation": f"Security alert: {inc['ai_forensic_report']} Is there anything else you'd like me to help you find?"
                }

    # Otherwise check ambient memories
    matched = None
    best_score = 0
    for mem in memories:
        name = mem.get("object_name", "").lower()
        cat = mem.get("category", "").lower()
        context = mem.get("room_context", "").lower()
        score = sum(3 for kw in query_keywords if kw in name) + \
                sum(2 for kw in query_keywords if kw in cat) + \
                sum(1 for kw in query_keywords if kw in context)
        if score > best_score:
            best_score = score
            matched = mem

    if matched and best_score > 0:
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
            "explanation": f"Your {matched['object_name']} was last spotted on the {matched['room_context']}. Is there anything else you'd like me to help you find?"
        }

    return {
        "found": False,
        "target_object": target_clean,
        "explanation": f"I checked your camera memory, but haven't spotted your {target_clean} yet. Is there anything else you'd like me to help you find?"
    }
