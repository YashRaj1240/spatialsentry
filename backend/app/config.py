import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Safe zero-dependency .env loader
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


# API Configuration
META_MODEL_API_KEY = os.getenv("META_MODEL_API_KEY", "").strip()
META_API_BASE_URL = os.getenv("META_API_BASE_URL", "https://api.dev.meta.ai/v1").rstrip("/")

# Determine active mode
is_dummy_key = not META_MODEL_API_KEY or META_MODEL_API_KEY.startswith("your_") or "dummy" in META_MODEL_API_KEY.lower()
MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() in ("true", "1", "yes") or is_dummy_key

# Directories
DATA_DIR = BASE_DIR / "data"
THUMBNAILS_DIR = DATA_DIR / "thumbnails"
SCENES_DIR = DATA_DIR / "sample_scenes"
INCIDENTS_DIR = DATA_DIR / "incidents"
DB_PATH = DATA_DIR / "aegis_sentinel.db"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
SCENES_DIR.mkdir(parents=True, exist_ok=True)
INCIDENTS_DIR.mkdir(parents=True, exist_ok=True)
