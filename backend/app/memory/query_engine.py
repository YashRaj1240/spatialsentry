from datetime import datetime
from typing import Dict, Any
from app.memory.database import get_all_memories, search_memories_keyword
from app.models.meta_client import meta_client

def format_time_elapsed(iso_timestamp: str) -> str:
    """Calculates human-friendly elapsed time like '2 hours and 14 minutes ago'"""
    try:
        past = datetime.fromisoformat(iso_timestamp)
        now = datetime.now()
        delta = now - past

        seconds = int(delta.total_seconds())
        if seconds < 60:
            return "just a few seconds ago"
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        hours = minutes // 60
        rem_min = minutes % 60
        if hours < 24:
            return f"{hours} hour{'s' if hours > 1 else ''} and {rem_min} min ago"
        days = hours // 24
        return f"{days} day{'s' if days > 1 else ''} ago"
    except Exception:
        return "recently"

async def answer_spatial_query(query_text: str) -> Dict[str, Any]:
    # 1. Fetch memories
    all_memories = get_all_memories(limit=50)

    # 2. Invoke Muse Spark
    reasoning_result = await meta_client.reason_spatial_query(query_text, all_memories)

    if reasoning_result.get("found"):
        ts = reasoning_result.get("last_seen_timestamp", "")
        time_ago = format_time_elapsed(ts) if ts else "recently"
        reasoning_result["time_ago"] = time_ago
        reasoning_result["display_time"] = ts[:16].replace("T", " ") if ts else ""

    return reasoning_result
