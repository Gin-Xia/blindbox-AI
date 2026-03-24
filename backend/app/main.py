from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")  # load before any os.getenv() calls

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import UPLOAD_DIR, OUTPUT_DIR, ALLOWED_ORIGINS
from app.routers import upload, styles, generation


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload CLIP model at startup (~338MB download on first run)
    from app.services.clip_service import load_clip_model
    print("Loading CLIP model...")
    load_clip_model()
    print("CLIP model ready.")
    yield


app = FastAPI(title="AI盲盒3D生成系统", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/static/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

app.include_router(upload.router, prefix="/api")
app.include_router(styles.router, prefix="/api")
app.include_router(generation.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
