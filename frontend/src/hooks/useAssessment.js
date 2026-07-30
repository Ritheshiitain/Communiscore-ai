import { useCallback, useEffect, useRef, useState } from 'react';
import { predictEmotion, predictGaze, predictPosture, predictVoice } from '../api/client';

const EMOTION_TO_SCORE = {
  Happiness: 90,
  Neutral:   70,
  Surprise:  65,
  Contempt:  40,
  Sadness:   35,
  Fear:      30,
  Disgust:   25,
  Anger:     20,
};

const FRAME_INTERVAL_MS = 1500;
const AUDIO_INTERVAL_MS = 3000;

function captureFrame(videoEl, canvasEl) {
  const ctx = canvasEl.getContext('2d');
  canvasEl.width = videoEl.videoWidth || 640;
  canvasEl.height = videoEl.videoHeight || 480;
  ctx.drawImage(videoEl, 0, 0);
  return canvasEl.toDataURL('image/jpeg', 0.75);
}

/* ── Browser WAV Encoder ── */
async function convertWebmToWav(webmBlob) {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error('[Audio Decode] Failed to decode WebM to AudioBuffer:', e);
    throw e;
  } finally {
    audioCtx.close();
  }

  const numOfChan = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // Raw PCM
  const bitDepth = 16;
  
  let result;
  if (numOfChan === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    let index = 0;
    let inputIndex = 0;
    while (index < result.length) {
      result[index++] = left[inputIndex];
      result[index++] = right[inputIndex];
      inputIndex++;
    }
  } else {
    result = audioBuffer.getChannelData(0);
  }
  
  const buffer = new ArrayBuffer(44 + result.length * 2);
  const view = new DataView(buffer);
  
  const writeString = (v, offset, str) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + result.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * 2, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, result.length * 2, true);
  
  // float to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

const DEFAULT_METRICS = {
  eyeContact: 0,
  posture: 0,
  emotion: 'Neutral',
  emotionConfidence: 0,
  emotionScores: {},
  vocalConfidence: 0,
  voiceEmotion: 'unknown',
};

export function useAssessment(isActive, activeTab) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const vocalConfidenceRef = useRef(0);
  const visionInFlight = useRef(false);
  const voiceInFlight = useRef(false);

  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [timeline, setTimeline] = useState([]);

  const appendTimeline = useCallback((point) => {
    setTimeline((prev) => {
      const next = [...prev, point];
      return next.length > 60 ? next.slice(-60) : next;
    });
  }, []);

  const runVisionAnalysis = useCallback(async () => {
    if (visionInFlight.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    visionInFlight.current = true;
    const frame = captureFrame(video, canvas);

    try {
      const [emotionResult, gazeResult, postureResult] = await Promise.allSettled([
        predictEmotion(frame),
        predictGaze(frame),
        predictPosture(frame),
      ]);

      const emotionRes = emotionResult.status === 'fulfilled' ? emotionResult.value : null;
      const gazeRes    = gazeResult.status === 'fulfilled'    ? gazeResult.value    : null;
      const postureRes = postureResult.status === 'fulfilled' ? postureResult.value : null;

      if (emotionResult.status === 'rejected') {
        console.warn('[Vision] Emotion analysis failed:', emotionResult.reason);
      }
      if (gazeResult.status === 'rejected') {
        console.warn('[Vision] Gaze analysis failed:', gazeResult.reason);
      }
      if (postureResult.status === 'rejected') {
        console.warn('[Vision] Posture analysis failed:', postureResult.reason);
      }

      setMetrics((prev) => {
        const next = { ...prev };
        if (gazeRes) {
          next.eyeContact = gazeRes.eye_contact_percent ?? next.eyeContact;
        }
        if (postureRes) {
          next.posture = postureRes.posture_score ?? next.posture;
        }
        if (emotionRes) {
          next.emotion = emotionRes.emotion ?? next.emotion;
          next.emotionConfidence = emotionRes.confidence ?? next.emotionConfidence;
          next.emotionScores = emotionRes.scores ?? next.emotionScores;
        }
        return next;
      });

      const emotionScore = emotionRes
        ? (EMOTION_TO_SCORE[emotionRes.emotion] ?? Math.round((emotionRes.confidence ?? 0) * 100))
        : 50;

      appendTimeline({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        eyeContact:        gazeRes?.eye_contact_percent ?? 0,
        posture:           postureRes?.posture_score    ?? 0,
        emotionScore,
        vocalConfidence:   vocalConfidenceRef.current,
      });
    } catch (err) {
      console.warn('[Vision] General analysis error:', err.message);
    } finally {
      visionInFlight.current = false;
    }
  }, [appendTimeline]);

  const runVoiceAnalysis = useCallback(() => {
    if (voiceInFlight.current) return;
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'inactive') return;

    voiceInFlight.current = true;
    audioChunksRef.current = [];
    recorder.start();

    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 2500);
  }, []);

  /* ── Media Setup ── */
  useEffect(() => {
    let mounted = true;

    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
        });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        
        // Bind immediately if videoRef is already rendered
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        const audioStream = new MediaStream(stream.getAudioTracks());
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

        const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const webmBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          voiceInFlight.current = false;

          if (webmBlob.size < 1000) return;

          try {
            const wavBlob = await convertWebmToWav(webmBlob);
            const res = await predictVoice(wavBlob, 'chunk.wav');
            const vocal = res.vocal_confidence_percent ?? 0;
            vocalConfidenceRef.current = vocal;

            setMetrics((prev) => ({
              ...prev,
              vocalConfidence: vocal,
              voiceEmotion: res.emotion ?? prev.voiceEmotion,
            }));

            setTimeline((prev) => {
              if (!prev.length) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                vocalConfidence: vocal,
              };
              return updated;
            });
          } catch (err) {
            console.warn('[Voice] Analysis error:', err.message);
          }
        };

        setIsReady(true);
        setError(null);
      } catch (err) {
        const msg =
          err.name === 'NotAllowedError'
            ? 'Camera/microphone permission denied. Please allow access and refresh.'
            : err.name === 'NotFoundError'
            ? 'No camera or microphone found on this device.'
            : err.message || 'Could not access webcam/microphone';
        setError(msg);
      }
    }

    setupMedia();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ── Bind Stream to Video Element on tab switch ── */
  useEffect(() => {
    if (streamRef.current && videoRef.current && activeTab === 'vr') {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.log('[useAssessment] Video play callback interrupted:', err);
      });
    }
  }, [activeTab, isReady]);

  /* ── Analysis Loop ── */
  useEffect(() => {
    if (!isActive || !isReady) return;

    runVisionAnalysis();
    runVoiceAnalysis();

    const frameTimer = setInterval(runVisionAnalysis, FRAME_INTERVAL_MS);
    const audioTimer = setInterval(runVoiceAnalysis, AUDIO_INTERVAL_MS);

    return () => {
      clearInterval(frameTimer);
      clearInterval(audioTimer);
    };
  }, [isActive, isReady, runVisionAnalysis, runVoiceAnalysis]);

  return { videoRef, canvasRef, metrics, timeline, error, isReady };
}
