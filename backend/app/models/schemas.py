from pydantic import BaseModel
from typing import Literal


class UploadResponse(BaseModel):
    file_id: str
    preview_url: str


class StyleSuggestion(BaseModel):
    style_id: int
    style_name: str
    prompt: str
    aesthetic: Literal["fantasy", "cyberpunk", "chibi"]


class AnalyzeRequest(BaseModel):
    file_id: str


class AnalyzeResponse(BaseModel):
    file_id: str
    nobg_preview_url: str
    clip_tags: list[str]
    styles: list[StyleSuggestion]


class GenerateRequest(BaseModel):
    file_id: str
    prompt: str
    style_name: str


class GenerateResponse(BaseModel):
    task_id: str
    status: str
    message: str


class TaskStatus(BaseModel):
    task_id: str
    status: Literal["pending", "processing", "done", "failed"]
    progress_message: str | None = None
    glb_url: str | None = None
    error: str | None = None
