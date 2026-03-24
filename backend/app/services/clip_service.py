from pathlib import Path
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from app.config import CLIP_MODEL_NAME

_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None


def load_clip_model():
    global _model, _processor
    _processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)
    _model = CLIPModel.from_pretrained(CLIP_MODEL_NAME)
    _model.eval()


def _ensure_loaded():
    if _model is None or _processor is None:
        load_clip_model()


def remove_background(input_path: Path) -> Path:
    """Remove image background using rembg, save as transparent PNG."""
    from rembg import remove

    output_path = input_path.parent / f"{input_path.stem}.nobg.png"
    if output_path.exists():
        return output_path  # already processed

    with open(input_path, "rb") as f:
        result = remove(f.read())
    output_path.write_bytes(result)
    return output_path


def classify_tags(image_path: Path, tag_list: list[str], top_k: int = 2) -> list[str]:
    """Zero-shot classify image against tag_list, return top_k tags."""
    _ensure_loaded()

    image = Image.open(image_path).convert("RGBA")
    # Paste onto white background for CLIP (it doesn't handle alpha well)
    bg = Image.new("RGB", image.size, (255, 255, 255))
    if image.mode == "RGBA":
        bg.paste(image, mask=image.split()[3])
    else:
        bg.paste(image)

    inputs = _processor(text=tag_list, images=bg, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = _model(**inputs)
        logits = outputs.logits_per_image[0]  # [N_tags]
        probs = logits.softmax(dim=0)

    top_indices = probs.topk(min(top_k, len(tag_list))).indices.tolist()
    return [tag_list[i] for i in top_indices]
