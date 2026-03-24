import uuid
import shutil
from pathlib import Path
from app.config import UPLOAD_DIR, OUTPUT_DIR


def save_upload(file_bytes: bytes, original_filename: str) -> tuple[str, Path]:
    """Save uploaded file, return (file_id, saved_path)."""
    suffix = Path(original_filename).suffix.lower() or ".jpg"
    file_id = uuid.uuid4().hex
    dest = UPLOAD_DIR / f"{file_id}{suffix}"
    dest.write_bytes(file_bytes)
    return file_id, dest


def get_upload_path(file_id: str) -> Path | None:
    """Find uploaded file by file_id (any extension)."""
    for f in UPLOAD_DIR.iterdir():
        # Match file_id prefix, exclude .nobg.png files
        if f.stem == file_id:
            return f
    return None


def get_nobg_path(file_id: str) -> Path:
    """Return the expected path for background-removed PNG."""
    return UPLOAD_DIR / f"{file_id}.nobg.png"


def save_glb(src_path: str | Path, task_id: str) -> Path:
    """Copy a GLB file to the outputs directory."""
    dest = OUTPUT_DIR / f"{task_id}.glb"
    shutil.copy(str(src_path), str(dest))
    return dest
