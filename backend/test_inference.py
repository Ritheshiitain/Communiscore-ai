import numpy as np
import cv2
import time
from services.emotion_service import predict_emotion, _get_models as load_emotion
from services.gaze_service import predict_gaze, _get_landmarker as load_gaze
from services.posture_service import predict_posture, _get_pose as load_posture

print("Generating dummy image...")
dummy = np.zeros((480, 640, 3), dtype=np.uint8)

print("Loading emotion models...")
load_emotion()
print("Running emotion inference...")
t0 = time.time()
res_emotion = predict_emotion(dummy)
print(f"Emotion success in {time.time()-t0:.3f}s: {res_emotion}")

print("Loading gaze models...")
load_gaze()
print("Running gaze inference...")
t0 = time.time()
res_gaze = predict_gaze(dummy)
print(f"Gaze success in {time.time()-t0:.3f}s: {res_gaze}")

print("Loading posture models...")
try:
    load_posture()
    print("Running posture inference...")
    t0 = time.time()
    res_posture = predict_posture(dummy)
    print(f"Posture success in {time.time()-t0:.3f}s: {res_posture}")
except Exception as e:
    print(f"Posture failed: {e}")

print("All tests completed successfully!")
