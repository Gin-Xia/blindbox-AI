from pathlib import Path
from app.models.schemas import StyleSuggestion
from app.services.clip_service import classify_tags

# ── Tag vocabularies ───────────────────────────────────────────────────────────

ACCESSORIES = [
    "a person holding a balloon",
    "a person wearing a hat or cap",
    "a person holding flowers",
    "a person carrying a backpack",
    "a person wearing glasses or sunglasses",
    "a person holding a phone or camera",
    "a person wearing a scarf or mask",
    "a person wearing a dress or skirt",
    "a person in casual street clothes",
    "a person sitting cross-legged",
    "a person in a standing pose",
    "a person in sportswear",
]

HAIR_STYLES = [
    "a person with long black hair",
    "a person with short black hair",
    "a person with long brown or blonde hair",
    "a person with colorful or dyed hair",
    "a person with a ponytail or bun",
    "a person with curly hair",
]

CLOTHING_VIBES = [
    "casual everyday outfit",
    "cute kawaii pastel outfit",
    "elegant or formal clothing",
    "sporty athletic wear",
    "vintage or retro style outfit",
    "trendy streetwear outfit",
]

# ── Prompt templates ───────────────────────────────────────────────────────────

_BASE = (
    "A chibi Pop Mart style collectible figurine, {accessories}, {hair}, "
    "{vibe}, smooth vinyl toy material, big sparkling eyes, chubby cute face"
)

TEMPLATES = {
    "梦幻仙女": (
        _BASE + ", pastel fantasy theme, fairy wings and sparkles, "
        "soft pink and lavender gradient background, rose gold glitter accents, "
        "3D render, octane render, high detail, 8K, product photography"
    ),
    "赛博朋克": (
        _BASE + ", cyberpunk neon city theme, holographic visor, "
        "chrome and circuit-board accents, electric blue and hot pink neon glow, "
        "dark futuristic background, 3D render, octane render, high detail, 8K"
    ),
    "Q版萌系": (
        _BASE + ", super kawaii chibi style, 3-head-tall body proportions, "
        "rosy blush cheeks, seasonal flower accessories, "
        "clean white studio background, smooth plastic toy finish, "
        "3D render, soft studio lighting, 8K"
    ),
}

AESTHETICS = ["fantasy", "cyberpunk", "chibi"]
STYLE_NAMES = list(TEMPLATES.keys())


def _extract_label(tag: str) -> str:
    """Strip 'a person ' prefix to get a clean descriptor."""
    return tag.removeprefix("a person ")


def generate_style_suggestions(
    nobg_image_path: Path,
) -> tuple[list[str], list[StyleSuggestion]]:
    """
    Run CLIP zero-shot classification on the bg-removed image,
    then build 3 personalized Pop Mart style prompts.
    Returns (all_clip_tags, [StyleSuggestion x3]).
    """
    top_accessories = classify_tags(nobg_image_path, ACCESSORIES, top_k=3)
    top_hair = classify_tags(nobg_image_path, HAIR_STYLES, top_k=1)
    top_vibe = classify_tags(nobg_image_path, CLOTHING_VIBES, top_k=1)

    accessories_str = ", ".join(_extract_label(t) for t in top_accessories)
    hair_str = _extract_label(top_hair[0]) if top_hair else "black hair"
    vibe_str = top_vibe[0] if top_vibe else "casual outfit"

    all_tags = top_accessories + top_hair + top_vibe

    styles: list[StyleSuggestion] = []
    for idx, (name, template) in enumerate(TEMPLATES.items()):
        prompt = template.format(
            accessories=accessories_str,
            hair=hair_str,
            vibe=vibe_str,
        )
        styles.append(StyleSuggestion(
            style_id=idx,
            style_name=name,
            prompt=prompt,
            aesthetic=AESTHETICS[idx],
        ))

    return all_tags, styles
