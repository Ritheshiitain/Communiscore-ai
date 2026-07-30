import numpy as np
import soundfile as sf
import io
import time
from services.voice_service import predict_voice

print("Generating dummy 1-second audio...")
sr = 16000
t = np.linspace(0, 1, sr, endpoint=False)
y = 0.5 * np.sin(2 * np.pi * 440 * t) # 440Hz sine wave

# Write to a byte buffer as a WAV file
wav_io = io.BytesIO()
sf.write(wav_io, y, sr, format='WAV')
wav_bytes = wav_io.getvalue()

print("Loading voice model and running voice inference...")
t0 = time.time()
res = predict_voice(wav_bytes, filename="dummy.wav")
print(f"Voice success in {time.time()-t0:.3f}s: {res}")
