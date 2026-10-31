import io
import uuid
from datetime import datetime
from pathlib import Path
from PIL import Image
from app.config import THUMBNAILS_DIR, SCENES_DIR
from app.memory.database import insert_memory
from app.models.meta_client import meta_client

async def process_keyframe(
    image_bytes: bytes,
    session_id: str,
    room_context: str = "Unspecified indoor room",
    target_hint: str = None
) -> dict:
    """
    Processes an incoming camera frame:
    1. Runs SAM 3.1 to segment objects.
    2. Crops lightweight thumbnails.
    3. Saves lightweight metadata to SQLite.
    4. Ephemeral cleanup: Raw image is discarded, keeping storage under 15MB/day.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size

    # Save a compressed scene frame for visualization preview
    frame_id = f"frame_{uuid.uuid4().hex[:8]}"
    frame_rel_path = f"sample_scenes/{frame_id}.jpg"
    full_frame_path = SCENES_DIR / f"{frame_id}.jpg"
    image.save(full_frame_path, "JPEG", quality=75, optimize=True)

    # 1. Run SAM 3.1 segmentation
    segments = await meta_client.segment_frame(image_bytes, prompt=target_hint)

    created_memories = []
    timestamp = datetime.now().isoformat()

    for idx, seg in enumerate(segments):
        label = seg.get("label", "unidentified_item")
        bbox = seg.get("bounding_box", [0, 0, width, height])
        polygon = seg.get("polygon", [])
        confidence = seg.get("confidence", 0.90)

        # 2. Crop lightweight thumbnail (e.g. 50-100px)
        x1, y1, x2, y2 = bbox
        # Bound clamps
        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(x1 + 1, min(x2, width))
        y2 = max(y1 + 1, min(y2, height))

        cropped = image.crop((x1, y1, x2, y2))
        thumb_id = f"thumb_{uuid.uuid4().hex[:8]}"
        thumb_rel_path = f"thumbnails/{thumb_id}.jpg"
        thumb_full_path = THUMBNAILS_DIR / f"{thumb_id}.jpg"
        cropped.save(thumb_full_path, "JPEG", quality=80)

        # Infer basic category
        category = "personal_items"
        if any(w in label for w in ["phone", "laptop", "airpod", "headphone", "charger", "mouse", "keyboard"]):
            category = "electronics"
        elif any(w in label for w in ["screwdriver", "hammer", "wrench", "pliers", "tool", "tape", "drill"]):
            category = "tools"
        elif any(w in label for w in ["mug", "cup", "bottle", "plate", "fork", "knife", "spoon", "pan"]):
            category = "kitchen"
        elif any(w in label for w in ["passport", "id", "card", "notebook", "book", "pen", "paper"]):
            category = "documents"

        # 3. Store metadata into SQLite
        memory_id = insert_memory(
            session_id=session_id,
            object_name=label,
            category=category,
            room_context=room_context,
            confidence=confidence,
            bounding_box=bbox,
            segmentation_polygon=polygon,
            thumbnail_path=thumb_rel_path,
            frame_path=frame_rel_path,
            timestamp=timestamp
        )

        created_memories.append({
            "memory_id": memory_id,
            "object_name": label,
            "category": category,
            "bounding_box": bbox,
            "polygon": polygon,
            "thumbnail_path": thumb_rel_path
        })

    return {
        "status": "success",
        "timestamp": timestamp,
        "segments_found": len(created_memories),
        "memories": created_memories,
        "frame_preview": frame_rel_path
    }
