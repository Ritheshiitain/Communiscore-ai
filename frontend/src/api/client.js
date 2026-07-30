const API_BASE = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '');

async function handleResponse(res, context) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[${context}] HTTP ${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json();
}

export async function predictEmotion(imageBase64) {
  const res = await fetch(`${API_BASE}/predict-emotion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  return handleResponse(res, 'emotion');
}

export async function predictGaze(imageBase64) {
  const res = await fetch(`${API_BASE}/predict-gaze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  return handleResponse(res, 'gaze');
}

export async function predictPosture(imageBase64) {
  const res = await fetch(`${API_BASE}/predict-posture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  return handleResponse(res, 'posture');
}

export async function predictVoice(audioBlob, filename = 'chunk.webm') {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);
  const res = await fetch(`${API_BASE}/predict-voice`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res, 'voice');
}

export async function predictAiImage(imageBase64) {
  const apiKey = localStorage.getItem('gemini_api_key') || '';
  const res = await fetch(`${API_BASE}/predict-ai-image`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Gemini-Key': apiKey
    },
    body: JSON.stringify({ image: imageBase64 }),
  });
  return handleResponse(res, 'ai-image');
}

export async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    console.warn('[Health Check] Fetch failed:', err);
    return false;
  }
}
