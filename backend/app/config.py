import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"
HUNYUAN_SPACE = "tencent/Hunyuan3D-2"

MAX_UPLOAD_SIZE_MB = 10
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:80,http://127.0.0.1")
ALLOWED_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]
