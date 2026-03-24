"""
Hunyuan3D-2 generation service.

In MOCK_MODE (default for development): sleeps 8 seconds then copies a sample GLB.
Set HUNYUAN_MOCK=false in .env to use the real HuggingFace Spaces API.

Real API note: Before enabling, visit
  https://huggingface.co/spaces/tencent/Hunyuan3D-2
click "API" tab to confirm the correct api_name and parameter names.
"""
import os
import asyncio
import shutil
from pathlib import Path

from app.config import OUTPUT_DIR
from app.storage.file_manager import save_glb

MOCK_MODE = os.getenv("HUNYUAN_MOCK", "true").lower() != "false"

# Path to a placeholder GLB used in mock mode (bundled with the repo)
_SAMPLE_GLB = Path(__file__).parent.parent.parent / "sample.glb"


async def run_hunyuan_task(
    task_id: str,
    image_path: Path,
    prompt: str,
    task_store: dict,
) -> None:
    task_store[task_id]["status"] = "processing"
    task_store[task_id]["progress_message"] = (
        "[Mock] Generating 3D model..." if MOCK_MODE
        else "Sending to Hunyuan3D-2 on HuggingFace Spaces (may take 5-20 min)..."
    )

    loop = asyncio.get_event_loop()
    try:
        if MOCK_MODE:
            glb_path = await loop.run_in_executor(None, _mock_generate, task_id)
        else:
            glb_path = await loop.run_in_executor(
                None, _real_generate, str(image_path), prompt, task_id
            )

        task_store[task_id].update({
            "status": "done",
            "progress_message": "3D model ready!",
            "glb_url": f"/static/outputs/{task_id}.glb",
            "error": None,
        })
    except Exception as exc:
        task_store[task_id].update({
            "status": "failed",
            "progress_message": None,
            "error": str(exc),
        })


# ── Mock implementation ────────────────────────────────────────────────────────

def _mock_generate(task_id: str) -> Path:
    import time
    time.sleep(8)  # simulate generation time

    dest = OUTPUT_DIR / f"{task_id}.glb"
    if _SAMPLE_GLB.exists():
        shutil.copy(_SAMPLE_GLB, dest)
    else:
        # Create a minimal valid GLB (12-byte header only) so the viewer gets a file
        _write_minimal_glb(dest)
    return dest


def _write_minimal_glb(path: Path):
    """Write a GLB file containing a pink cube — visible in Three.js for pipeline testing."""
    import struct, json as _json

    # ── Geometry ──────────────────────────────────────────────────────────────
    # 8 unique corner vertices of a unit cube centred at origin
    vertices = [
        -0.5, -0.5, -0.5,   # 0
         0.5, -0.5, -0.5,   # 1
         0.5,  0.5, -0.5,   # 2
        -0.5,  0.5, -0.5,   # 3
        -0.5, -0.5,  0.5,   # 4
         0.5, -0.5,  0.5,   # 5
         0.5,  0.5,  0.5,   # 6
        -0.5,  0.5,  0.5,   # 7
    ]
    indices = [
        0,1,2, 0,2,3,   # -z face
        4,6,5, 4,7,6,   # +z face
        0,3,7, 0,7,4,   # -x face
        1,5,6, 1,6,2,   # +x face
        0,4,5, 0,5,1,   # -y face
        3,2,6, 3,6,7,   # +y face
    ]

    # ── Binary buffer ─────────────────────────────────────────────────────────
    index_bin  = struct.pack(f"<{len(indices)}H", *indices)   # uint16, 72 bytes
    vertex_bin = struct.pack(f"<{len(vertices)}f", *vertices) # float32, 96 bytes
    bin_data   = index_bin + vertex_bin  # 168 bytes, already 4-byte aligned

    # ── glTF JSON ─────────────────────────────────────────────────────────────
    gltf = {
        "asset": {"version": "2.0"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{
            "primitives": [{
                "attributes": {"POSITION": 1},
                "indices": 0,
                "material": 0,
                "mode": 4,   # TRIANGLES
            }]
        }],
        "materials": [{
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 0.42, 0.62, 1.0],   # Pop-Mart pink
                "metallicFactor": 0.3,
                "roughnessFactor": 0.5,
            },
            "doubleSided": True,
        }],
        "accessors": [
            {   # indices
                "bufferView": 0,
                "componentType": 5123,   # UNSIGNED_SHORT
                "count": len(indices),
                "type": "SCALAR",
            },
            {   # positions
                "bufferView": 1,
                "componentType": 5126,   # FLOAT
                "count": 8,
                "type": "VEC3",
                "min": [-0.5, -0.5, -0.5],
                "max": [ 0.5,  0.5,  0.5],
            },
        ],
        "bufferViews": [
            {   # index buffer view
                "buffer": 0, "byteOffset": 0,
                "byteLength": len(index_bin), "target": 34963,
            },
            {   # vertex buffer view
                "buffer": 0, "byteOffset": len(index_bin),
                "byteLength": len(vertex_bin), "target": 34962,
            },
        ],
        "buffers": [{"byteLength": len(bin_data)}],
    }

    json_bytes = _json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    with open(path, "wb") as f:
        # GLB header (12 bytes)
        f.write(b"glTF")
        f.write(struct.pack("<I", 2))
        f.write(struct.pack("<I", total_len))
        # JSON chunk
        f.write(struct.pack("<I", len(json_bytes)))
        f.write(struct.pack("<I", 0x4E4F534A))   # JSON
        f.write(json_bytes)
        # BIN chunk
        f.write(struct.pack("<I", len(bin_data)))
        f.write(struct.pack("<I", 0x004E4942))   # BIN\0
        f.write(bin_data)


# ── Real implementation ────────────────────────────────────────────────────────

def _real_generate(image_path: str, prompt: str, task_id: str) -> Path:
    import os
    from gradio_client import Client, handle_file

    token  = os.getenv("HF_TOKEN") or None
    client = Client("tencent/Hunyuan3D-2", token=token)
    result = client.predict(
        caption=prompt,
        image=handle_file(image_path),
        steps=30,
        guidance_scale=5.0,
        seed=1234,
        octree_resolution=256,
        check_box_rembg=False,
        num_chunks=8000,
        randomize_seed=False,
        api_name="/shape_generation",
    )
    # result = (glb_filepath, html_output, mesh_stats, seed)
    # result[0] may be a plain path string or a gradio update dict {"value": path, "__type__": "update"}
    glb_path = result[0]
    if isinstance(glb_path, dict):
        glb_path = glb_path.get("value") or glb_path.get("path") or glb_path.get("url")
    return save_glb(glb_path, task_id)
