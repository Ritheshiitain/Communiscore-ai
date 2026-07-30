import numpy as np
from hsemotion_onnx.facial_emotions import HSEmotionRecognizer
from uniface.detection import RetinaFace

EMOTION_LABELS = [
    "Anger",
    "Contempt",
    "Disgust",
    "Fear",
    "Happiness",
    "Neutral",
    "Sadness",
    "Surprise",
]

_fer: HSEmotionRecognizer | None = None
_detector: RetinaFace | None = None


def _get_models():
    global _fer, _detector
    if _fer is None:
        _fer = HSEmotionRecognizer(model_name="enet_b0_8_best_afew")
    if _detector is None:
        _detector = RetinaFace(confidence_threshold=0.5)
    return _fer, _detector


def _crop_largest_face(image: np.ndarray, detector: RetinaFace) -> np.ndarray | None:
    faces = detector.detect(image)
    if not faces:
        return None

    largest = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    x1, y1, x2, y2 = map(int, largest.bbox[:4])
    h, w = image.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    crop = image[y1:y2, x1:x2]
    return crop if crop.size > 0 else None


def predict_emotion(image: np.ndarray) -> dict:
    fer, detector = _get_models()
    face_crop = _crop_largest_face(image, detector)
    if face_crop is None:
        return {
            "emotion": "Neutral",
            "confidence": 0.0,
            "scores": {label: 0.0 for label in EMOTION_LABELS},
            "face_detected": False,
        }

    emotion, scores = fer.predict_emotions(face_crop, logits=False)
    scores_arr = np.asarray(scores).flatten()
    score_map = {
        EMOTION_LABELS[i]: float(scores_arr[i]) for i in range(min(len(EMOTION_LABELS), len(scores_arr)))
    }
    confidence = float(score_map.get(emotion, max(score_map.values(), default=0.0)))

    return {
        "emotion": emotion,
        "confidence": confidence,
        "scores": score_map,
        "face_detected": True,
    }
