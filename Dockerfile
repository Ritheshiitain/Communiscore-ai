# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build FastAPI Backend
FROM python:3.10-slim

# Install system dependencies for OpenCV, X11, and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsndfile1 \
    libgl1 \
    libxcb1 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install matching lightweight CPU-only PyTorch & Torchaudio
RUN pip install --no-cache-dir torch==2.4.0 torchaudio==2.4.0 --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy backend files
COPY backend/ .

# Copy compiled frontend from Stage 1 into the backend's static directory
COPY --from=frontend-builder /frontend/dist ./static

# Expose port and start (Hugging Face expects port 7860)
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
