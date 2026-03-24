from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import UploadResponse
from app.storage.file_manager import save_upload
from app.config import MAX_UPLOAD_SIZE_MB, ALLOWED_IMAGE_TYPES

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WEBP"
        )

    # Read and validate size
    file_bytes = await file.read()
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=422,
            detail=f"File too large. Max size: {MAX_UPLOAD_SIZE_MB}MB"
        )

    file_id, saved_path = save_upload(file_bytes, file.filename or "upload.jpg")

    return UploadResponse(
        file_id=file_id,
        preview_url=f"/static/uploads/{saved_path.name}",
    )
