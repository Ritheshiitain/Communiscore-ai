import asyncio
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.emotion_service import predict_emotion
from services.emotion_service import _get_models as load_emotion
from services.gaze_service import predict_gaze
from services.gaze_service import _get_models as load_gaze
from services.posture_service import predict_posture
from services.posture_service import _get_pose
from services.voice_service import predict_voice
from services.ai_service import analyze_image_with_gemini
from utils.image_utils import decode_image


class ImageFrameRequest(BaseModel):
    image: str


class AIFrameRequest(BaseModel):
    image: str


# Global lock to serialize ML inference and prevent multi-threading deadlocks in C++ backends (ONNX/MediaPipe)
inference_lock = asyncio.Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lazy load models to keep startup RAM usage under 512MB
    yield



app = FastAPI(title="BehaviorIQ API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict-emotion")
async def predict_emotion_endpoint(body: ImageFrameRequest):
    async with inference_lock:
        image = decode_image(body.image)
        res = predict_emotion(image)
        return res


@app.post("/predict-gaze")
async def predict_gaze_endpoint(body: ImageFrameRequest):
    async with inference_lock:
        image = decode_image(body.image)
        res = predict_gaze(image)
        return res


@app.post("/predict-posture")
async def predict_posture_endpoint(body: ImageFrameRequest):
    async with inference_lock:
        image = decode_image(body.image)
        res = predict_posture(image)
        return res


@app.post("/predict-voice")
async def predict_voice_endpoint(audio: UploadFile = File(...)):
    async with inference_lock:
        audio_bytes = await audio.read()
        res = predict_voice(audio_bytes, filename=audio.filename or "chunk.webm")
        return res


@app.post("/predict-ai-image")
async def predict_ai_image_endpoint(body: AIFrameRequest, x_gemini_key: str = Header(None)):
    if not x_gemini_key:
        return {"success": False, "error": "Google Gemini API Key is missing. Please set it in the Settings tab."}
    
    # Run the external network call to Gemini without blocking local inference
    res = analyze_image_with_gemini(body.image, x_gemini_key)
    return res
