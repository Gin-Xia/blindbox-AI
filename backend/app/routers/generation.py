import uuid
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse, TaskStatus
from app.storage.file_manager import get_nobg_path
from app.services.hunyuan_service import run_hunyuan_task

router = APIRouter()

# In-memory task store (sufficient for demo)
TASK_STORE: dict[str, dict] = {}


@router.post("/generate", response_model=GenerateResponse, status_code=202)
async def generate_3d(req: GenerateRequest, background_tasks: BackgroundTasks):
    nobg_path = get_nobg_path(req.file_id)
    if not nobg_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed image not found. Call /api/analyze first."
        )

    task_id = f"task-{uuid.uuid4().hex[:8]}"
    TASK_STORE[task_id] = {
        "task_id": task_id,
        "status": "pending",
        "progress_message": "Task queued, starting shortly...",
        "glb_url": None,
        "error": None,
        "created_at": datetime.utcnow().isoformat(),
    }

    background_tasks.add_task(
        run_hunyuan_task,
        task_id=task_id,
        image_path=nobg_path,
        prompt=req.prompt,
        task_store=TASK_STORE,
    )

    return GenerateResponse(
        task_id=task_id,
        status="pending",
        message="3D generation started. Poll /api/status/{task_id} for updates.",
    )


@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_status(task_id: str):
    task = TASK_STORE.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return TaskStatus(**task)
