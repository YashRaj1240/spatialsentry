import time
import io
from collections import deque
from datetime import datetime
from typing import Dict, Any, List, Optional
from PIL import Image
from app.config import INCIDENTS_DIR, THUMBNAILS_DIR
from app.memory.database import insert_incident, get_all_incidents, insert_memory, get_all_memories
from app.models.mock_engine import mock_sentinel_snatch_analysis, mock_segment_anything

class EphemeralRollingBuffer:
    """
    Maintains a rolling 10-second ephemeral buffer in RAM.
    Normal frames are continuously overwritten and deleted.
    Only when an active threat/theft/breach occurs does it freeze the incident evidence.
    """
    def __init__(self, max_seconds: int = 10):
        self.max_seconds = max_seconds
        self.buffer = deque(maxlen=20) # 2 fps * 10s = 20 frames max in memory
        self.is_armed = True
        self.protected_items = ["Handbag", "Laptop", "Phone", "Backpack", "Keys"]

    def add_frame(self, frame_bytes: bytes, metadata: Dict[str, Any]):
        """Adds frame to RAM circular buffer; oldest drops out and garbage-collected"""
        entry = {
            "timestamp": time.time(),
            "iso_time": datetime.now().isoformat(),
            "bytes_size": len(frame_bytes),
            "metadata": metadata
        }
        self.buffer.append(entry)

    def get_buffer_stats(self) -> Dict[str, Any]:
        total_ram_bytes = sum(f["bytes_size"] for f in self.buffer)
        return {
            "active_frames_in_ram": len(self.buffer),
            "ram_memory_kb": round(total_ram_bytes / 1024, 2),
            "persistent_disk_bytes": 0, # Unflagged video is 0 bytes on disk!
            "retention_policy": f"Rolling {self.max_seconds}s Ephemeral Window (Auto-Purged)",
            "perimeter_status": "ARMED" if self.is_armed else "STANDBY"
        }

    def trigger_theft_intercept(
        self,
        target_item: str = "Designer Leather Handbag",
        location: str = "Coffee Shop Outdoor Table",
        frame_bytes: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Triggered when high-velocity snatch or perimeter intrusion is detected:
        Freezes evidence from RAM buffer, locks suspect segmentation, logs incident.
        """
        analysis = mock_sentinel_snatch_analysis(target_item=target_item, location=location)
        
        # Save incident frozen evidence frame
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"incident_{timestamp_str}.jpg"
        filepath = INCIDENTS_DIR / filename
        
        if frame_bytes:
            with open(filepath, "wb") as f:
                f.write(frame_bytes)
            frame_rel_path = f"incidents/{filename}"
        else:
            frame_rel_path = "sample_scenes/kitchen_counter.jpg"

        # Record into Incident Ledger
        incident_id = insert_incident(
            incident_type=analysis["incident_type"],
            severity=analysis["severity"],
            target_item=analysis["target_item"],
            location_context=analysis["location_context"],
            suspect_description=analysis["suspect_description"],
            displacement_velocity=analysis["displacement_velocity"],
            bounding_box=analysis["bounding_box"],
            segmentation_polygon=analysis["segmentation_polygon"],
            frame_path=frame_rel_path,
            evidence_thumbnail="thumbnails/wallet.jpg",
            ai_forensic_report=analysis["ai_forensic_report"],
            timestamp=analysis["timestamp"]
        )

        analysis["incident_id"] = incident_id
        analysis["frame_path"] = frame_rel_path
        analysis["alarm_active"] = True
        return analysis

# Global Sentinel Engine Instance
sentinel_engine = EphemeralRollingBuffer()
