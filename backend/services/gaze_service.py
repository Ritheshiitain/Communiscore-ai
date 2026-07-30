import math
import urllib.request
from pathlib import Path
import cv2
import mediapipe as mp
import numpy as np

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "face_landmarker.task"

_landmarker = None


def _get_landmarker():
    global _landmarker
    if _landmarker is None:
        if not MODEL_PATH.exists():
            MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
            url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            urllib.request.urlretrieve(url, MODEL_PATH)
        options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(model_asset_path=str(MODEL_PATH)),
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            output_face_blendshapes=True
        )
        _landmarker = mp.tasks.vision.FaceLandmarker.create_from_options(options)
    return _landmarker


def _dist(p1, p2) -> float:
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)


def predict_gaze(image: np.ndarray) -> dict:
    landmarker = _get_landmarker()
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = landmarker.detect(mp_image)

    if not result.face_landmarks:
        return {
            "eye_contact_percent": 0.0,
            "pitch_deg": None,
            "yaw_deg": None,
            "face_detected": False,
        }

    # Use the first detected face
    landmarks = result.face_landmarks[0]

    # MediaPipe FaceMesh Iris and Eye Landmarks
    # Left Eye: 33 (outer corner), 133 (inner corner), 468 (iris center)
    # Right Eye: 362 (inner corner), 263 (outer corner), 473 (iris center)
    try:
        left_iris = landmarks[468]
        left_outer = landmarks[33]
        left_inner = landmarks[133]

        right_iris = landmarks[473]
        right_inner = landmarks[362]
        right_outer = landmarks[263]

        # Calculate pupil-to-eye-corner ratio
        left_dist_outer = _dist(left_iris, left_outer)
        left_dist_inner = _dist(left_iris, left_inner)
        left_ratio = left_dist_inner / (left_dist_inner + left_dist_outer + 1e-6)

        right_dist_inner = _dist(right_iris, right_inner)
        right_dist_outer = _dist(right_iris, right_outer)
        right_ratio = right_dist_inner / (right_dist_inner + right_dist_outer + 1e-6)

        # Average deviation from center (which is 0.5)
        left_dev = abs(left_ratio - 0.5)
        right_dev = abs(right_ratio - 0.5)
        avg_dev = (left_dev + right_dev) / 2.0

        # Map deviation to a 0-100 eye contact score
        # A deviation of 0.15 indicates they are looking completely away
        eye_contact = max(0.0, 100.0 - (avg_dev / 0.15) * 100.0)
        
        # Estimate synthetic pitch/yaw for compatibility
        # Horizontally (yaw): left is positive, right is negative
        yaw_deg = (avg_dev * 45.0) if left_ratio > 0.5 else (-avg_dev * 45.0)
        pitch_deg = 0.0 # Standard forward baseline
        
        return {
            "eye_contact_percent": round(eye_contact, 1),
            "pitch_deg": round(pitch_deg, 2),
            "yaw_deg": round(yaw_deg, 2),
            "face_detected": True,
        }
    except Exception as e:
        print(f"[WARN] Gaze estimation error: {e}")
        return {
            "eye_contact_percent": 0.0,
            "pitch_deg": None,
            "yaw_deg": None,
            "face_detected": False,
        }
