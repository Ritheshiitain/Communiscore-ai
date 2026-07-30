from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "pose_landmarker_lite.task"

# BlazePose landmark indices
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_HIP = 23
RIGHT_HIP = 24
NOSE = 0

_landmarker: mp.tasks.vision.PoseLandmarker | None = None


def _get_pose():
    global _landmarker
    if _landmarker is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Pose model not found at {MODEL_PATH}. "
                "Download pose_landmarker_lite.task into backend/models/"
            )
        options = mp.tasks.vision.PoseLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(model_asset_path=str(MODEL_PATH)),
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            num_poses=1,
            min_pose_detection_confidence=0.5,
        )
        _landmarker = mp.tasks.vision.PoseLandmarker.create_from_options(options)
    return _landmarker


def _angle_between(p1: tuple[float, float], p2: tuple[float, float], p3: tuple[float, float]) -> float:
    """Return angle at p2 in degrees."""
    v1 = np.array([p1[0] - p2[0], p1[1] - p2[1]])
    v2 = np.array([p3[0] - p2[0], p3[1] - p2[1]])
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    cos_angle = np.clip(np.dot(v1, v2) / (norm1 * norm2), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def _landmark_xy(landmarks, idx: int, w: int, h: int) -> tuple[float, float]:
    lm = landmarks[idx]
    return lm.x * w, lm.y * h


def predict_posture(image: np.ndarray) -> dict:
    landmarker = _get_pose()
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = landmarker.detect(mp_image)

    if not result.pose_landmarks:
        return {
            "posture_score": 0.0,
            "shoulder_alignment_score": 0.0,
            "spine_angle_score": 0.0,
            "pose_detected": False,
        }

    lm = result.pose_landmarks[0]
    left_shoulder = _landmark_xy(lm, LEFT_SHOULDER, w, h)
    right_shoulder = _landmark_xy(lm, RIGHT_SHOULDER, w, h)
    left_hip = _landmark_xy(lm, LEFT_HIP, w, h)
    right_hip = _landmark_xy(lm, RIGHT_HIP, w, h)
    nose = _landmark_xy(lm, NOSE, w, h)

    shoulder_y_diff = abs(left_shoulder[1] - right_shoulder[1])
    shoulder_width = max(abs(left_shoulder[0] - right_shoulder[0]), 1.0)
    shoulder_tilt_ratio = shoulder_y_diff / shoulder_width
    shoulder_score = max(0.0, 100.0 - shoulder_tilt_ratio * 200.0)

    mid_shoulder = (
        (left_shoulder[0] + right_shoulder[0]) / 2,
        (left_shoulder[1] + right_shoulder[1]) / 2,
    )
    mid_hip = ((left_hip[0] + right_hip[0]) / 2, (left_hip[1] + right_hip[1]) / 2)
    spine_angle = _angle_between(nose, mid_shoulder, mid_hip)
    ideal_spine = 170.0
    spine_deviation = abs(spine_angle - ideal_spine)
    spine_score = max(0.0, 100.0 - spine_deviation * 2.5)

    posture_score = round(0.45 * shoulder_score + 0.55 * spine_score, 1)

    return {
        "posture_score": posture_score,
        "shoulder_alignment_score": round(shoulder_score, 1),
        "spine_angle_score": round(spine_score, 1),
        "spine_angle_deg": round(spine_angle, 1),
        "pose_detected": True,
    }
