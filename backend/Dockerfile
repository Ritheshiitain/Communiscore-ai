# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build FastAPI Backend
FROM python:3.10-slim

# Install system dependencies for OpenCV and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install lightweight CPU-only PyTorch & Torchaudio to fit in Render Free Tier
RUN pip install --no-cache-dir --prefer-binary torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy backend files
COPY backend/ .

# Copy compiled frontend from Stage 1 into the backend's static directory
COPY --from=frontend-builder /frontend/dist ./static

# Expose port and start
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
