import io
import math
import os
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

_pipeline = None

# Check if running in a resource-constrained environment (Render Free Tier)
LIGHT_MODE = os.environ.get("RENDER") is not None

POSITIVE_EMOTIONS = {"happy", "calm", "neutral"}
NEGATIVE_EMOTIONS = {"angry", "sad", "fearful", "disgust"}


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        import torch
        from transformers import pipeline
        device = 0 if torch.cuda.is_available() else -1
        _pipeline = pipeline(
            "audio-classification",
            model="harshit345/xlsr-wav2vec-speech-emotion-recognition",
            device=device,
        )
    return _pipeline


def _load_audio(audio_bytes: bytes, suffix: str = ".webm", target_sr: int = 16000) -> tuple[np.ndarray, int]:
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        y, sr = sf.read(tmp_path)
        # Resample to target_sr (16000) using simple numpy linear interpolation
        if sr != target_sr:
            num_samples = int(len(y) * target_sr / sr)
            y = np.interp(np.linspace(0, len(y) - 1, num_samples), np.arange(len(y)), y)
            sr = target_sr
        # Convert stereo to mono
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)
        return y, sr
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def _speaking_metrics(y: np.ndarray, sr: int) -> dict:
    frame_length = int(0.025 * sr)
    hop_length = int(0.010 * sr)
    
    # Custom numpy sliding window calculation of RMS energy to avoid librosa / numba dependency
    num_frames = (len(y) - frame_length) // hop_length + 1
    if num_frames <= 0:
        return {
            "speech_ratio": 0.0,
            "pause_ratio": 1.0,
            "speaking_rate": 0.0,
            "duration_sec": len(y) / sr if sr else 0.1,
        }
        
    energy = []
    for i in range(0, len(y) - frame_length + 1, hop_length):
        frame = y[i : i + frame_length]
        rms = np.sqrt(np.mean(frame ** 2))
        energy.append(rms)
    energy = np.array(energy)
    
    threshold = max(float(np.percentile(energy, 60)) if len(energy) else 0.01, 0.01)
    speech_frames = energy > threshold
    speech_ratio = float(np.mean(speech_frames)) if len(speech_frames) else 0.0
    pause_ratio = 1.0 - speech_ratio

    transitions = np.diff(speech_frames.astype(int))
    speech_starts = np.sum(transitions == 1)
    duration_sec = max(len(y) / sr, 0.1)
    rate = speech_starts / duration_sec

    return {
        "speech_ratio": speech_ratio,
        "pause_ratio": pause_ratio,
        "speaking_rate": rate,
        "duration_sec": duration_sec,
    }


def _emotion_to_confidence(emotion_label: str, emotion_score: float) -> float:
    label = emotion_label.lower()
    if label in POSITIVE_EMOTIONS:
        base = 0.55 + 0.45 * emotion_score
    elif label in NEGATIVE_EMOTIONS:
        base = 0.45 * (1.0 - emotion_score)
    else:
        base = 0.5
    return base


def _compute_vocal_confidence(emotion_score: float, emotion_label: str, metrics: dict) -> float:
    emotion_component = _emotion_to_confidence(emotion_label, emotion_score)

    rate = metrics["speaking_rate"]
    rate_score = math.exp(-((rate - 2.5) ** 2) / 4.0)

    speech_ratio = metrics["speech_ratio"]
    pause_penalty = max(0.0, metrics["pause_ratio"] - 0.35) * 1.5

    raw = 0.5 * emotion_component + 0.3 * rate_score + 0.2 * speech_ratio
    raw -= pause_penalty
    return round(max(0.0, min(100.0, raw * 100.0)), 1)


def predict_voice(audio_bytes: bytes, filename: str = "chunk.webm") -> dict:
    suffix = Path(filename).suffix or ".webm"
    y, sr = _load_audio(audio_bytes, suffix=suffix)
    metrics = _speaking_metrics(y, sr)

    if len(y) < sr * 0.3:
        return {
            "vocal_confidence_percent": 0.0,
            "emotion": "unknown",
            "emotion_confidence": 0.0,
            "speaking_rate": metrics["speaking_rate"],
            "speech_ratio": metrics["speech_ratio"],
            "audio_detected": False,
        }

    if LIGHT_MODE:
        # Resource-efficient speaking metrics baseline without deep learning model overhead
        # Estimate voice emotion based on speaking rate
        rate = metrics["speaking_rate"]
        if rate > 3.5:
            emotion = "excited"
            emotion_confidence = 0.85
        elif rate < 1.2:
            emotion = "calm"
            emotion_confidence = 0.75
        else:
            emotion = "neutral"
            emotion_confidence = 0.90
            
        vocal_confidence = _compute_vocal_confidence(emotion_confidence, emotion, metrics)
        
        return {
            "vocal_confidence_percent": vocal_confidence,
            "emotion": emotion,
            "emotion_confidence": round(emotion_confidence, 3),
            "speaking_rate": round(metrics["speaking_rate"], 2),
            "speech_ratio": round(metrics["speech_ratio"], 3),
            "all_scores": {emotion: emotion_confidence},
            "audio_detected": True,
        }

    # Standard Deep Learning classification (used locally or on high-RAM servers)
    try:
        clf = _get_pipeline()
        results = clf({"raw": y, "sampling_rate": sr})
        top = results[0] if results else {"label": "neutral", "score": 0.0}
        emotion = top["label"]
        emotion_confidence = float(top["score"])
        vocal_confidence = _compute_vocal_confidence(emotion_confidence, emotion, metrics)
        all_scores = {r["label"]: round(float(r["score"]), 3) for r in results}
    except Exception as e:
        print(f"[WARN] Deep learning voice classifier failed, using fallback: {e}")
        # Fallback to speaking metrics
        rate = metrics["speaking_rate"]
        emotion = "neutral"
        emotion_confidence = 0.80
        vocal_confidence = _compute_vocal_confidence(emotion_confidence, emotion, metrics)
        all_scores = {emotion: emotion_confidence}

    return {
        "vocal_confidence_percent": vocal_confidence,
        "emotion": emotion,
        "emotion_confidence": round(emotion_confidence, 3),
        "speaking_rate": round(metrics["speaking_rate"], 2),
        "speech_ratio": round(metrics["speech_ratio"], 3),
        "all_scores": all_scores,
        "audio_detected": True,
    }

