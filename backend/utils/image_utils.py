import base64
import io

import cv2
import numpy as np
from PIL import Image


def decode_image(image_b64: str) -> np.ndarray:
    """Decode a base64-encoded image (with or without data-URL prefix) to BGR numpy array."""
    if "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]

    raw = base64.b64decode(image_b64)
    pil_image = Image.open(io.BytesIO(raw)).convert("RGB")
    rgb = np.array(pil_image)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
