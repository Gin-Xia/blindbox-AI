from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.storage.file_manager import get_upload_path, get_nobg_path
from app.services.prompt_service import generate_style_suggestions
from app.services.clip_service import remove_background

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(req: AnalyzeRequest):
    upload_path = get_upload_path(req.file_id)
    if not upload_path:
        raise HTTPException(status_code=404, detail="File not found. Upload first.")

    # Step 1: Remove background
    nobg_path = remove_background(upload_path)

    # Step 2: CLIP classify + build 3 style prompts
    clip_tags, styles = generate_style_suggestions(nobg_path)

    return AnalyzeResponse(
        file_id=req.file_id,
        nobg_preview_url=f"/static/uploads/{nobg_path.name}",
        clip_tags=clip_tags,
        styles=styles,
    )
