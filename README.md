# Communication & Behavior Assessment

Real-time webcam + microphone analytics dashboard for hackathon demos.

## Features

- **Facial Emotion** — HSEmotion ONNX (`enet_b0_8_best_afew`, 8 classes)
- **Eye Contact / Gaze** — UniFace RetinaFace + MobileGaze
- **Posture** — MediaPipe Pose landmarks
- **Vocal Confidence** — HuggingFace speech emotion + speaking rate/pause heuristics
- **Live Dashboard** — Score cards + multi-line behavioral timeline

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

First startup downloads ML model weights (may take a few minutes).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — allow webcam and microphone when prompted.

## API Endpoints

| Endpoint | Method | Input |
|----------|--------|-------|
| `/health` | GET | — |
| `/predict-emotion` | POST | `{ "image": "<base64>" }` |
| `/predict-gaze` | POST | `{ "image": "<base64>" }` |
| `/predict-posture` | POST | `{ "image": "<base64>" }` |
| `/predict-voice` | POST | `audio` file (multipart) |

## Project Structure

```
backend/
  main.py                 # FastAPI app
  services/               # Inference modules
  utils/                  # Image decoding helpers
frontend/
  src/
    components/           # UI components
    hooks/                # Webcam + analysis hook
    api/                  # Backend client
```
