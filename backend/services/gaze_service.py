import math

import numpy as np
from uniface.detection import RetinaFace
from uniface.gaze import MobileGaze

_detector: RetinaFace | None = None
_gaze: MobileGaze | None = None


def _get_models():
    global _detector, _gaze
    if _detector is None:
        _detector = RetinaFace(confidence_threshold=0.5)
    if _gaze is None:
        _gaze = MobileGaze()
    return _detector, _gaze


def pitch_yaw_to_eye_contact(pitch_deg: float, yaw_deg: float) -> float:
    """Map gaze deviation from center to 0-100 eye contact score."""
    deviation = math.sqrt(pitch_deg**2 + yaw_deg**2)
    # ~45° total deviation maps to ~0%; 0° maps to 100%
    score = max(0.0, 100.0 - (deviation / 45.0) * 100.0)
    return round(score, 1)


def predict_gaze(image: np.ndarray) -> dict:
    detector, gaze_estimator = _get_models()
    faces = detector.detect(image)

    if not faces:
        return {
            "eye_contact_percent": 0.0,
            "pitch_deg": None,
            "yaw_deg": None,
            "face_detected": False,
        }

    largest = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    x1, y1, x2, y2 = map(int, largest.bbox[:4])
    h, w = image.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    face_crop = image[y1:y2, x1:x2]

    if face_crop.size == 0:
        return {
            "eye_contact_percent": 0.0,
            "pitch_deg": None,
            "yaw_deg": None,
            "face_detected": False,
        }

    result = gaze_estimator.estimate(face_crop)
    pitch_deg = float(np.degrees(result.pitch))
    yaw_deg = float(np.degrees(result.yaw))
    eye_contact = pitch_yaw_to_eye_contact(pitch_deg, yaw_deg)

    return {
        "eye_contact_percent": eye_contact,
        "pitch_deg": round(pitch_deg, 2),
        "yaw_deg": round(yaw_deg, 2),
        "face_detected": True,
    }
