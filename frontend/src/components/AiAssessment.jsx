import React, { useState, useRef, useEffect } from 'react';
import { predictAiImage } from '../api/client';

export default function AiAssessment() {
  const [image, setImage] = useState(null); // base64 string
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setImage(null);
    } catch (err) {
      console.error('[Camera Error] Could not start webcam for snapshot:', err);
      setError('Could not access camera. Please check permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setImage(base64);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      stopCamera();
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError('Google Gemini API Key is missing. Please go to the "Settings" tab, enter your API Key, and try again.');
      setLoading(false);
      return;
    }

    try {
      const res = await predictAiImage(image);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.error || 'Failed to analyze image.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while calling the Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assessment" style={{ maxWidth: '1000px', margin: '20px auto 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="panel" style={{ padding: '24px' }}>
        <p className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Google Gemini Coach Assessment</p>
        <p className="panel-desc" style={{ marginBottom: '20px' }}>
          Upload a photo of your presentation stance, or capture a still from your camera, and get instant, detailed visual body-language coaching feedback using Gemini 1.5 Flash.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button 
            className="toggle-btn"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => fileInputRef.current.click()}
          >
            📂 Upload Image File
          </button>
          
          <button 
            className="toggle-btn"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={cameraActive ? stopCamera : startCamera}
          >
            📷 {cameraActive ? 'Close Camera' : 'Take Still Snapshot'}
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Video feed / image preview container */}
        <div style={{ 
          width: '100%', 
          maxWidth: '560px', 
          margin: '0 auto', 
          position: 'relative', 
          aspectRatio: '4/3', 
          background: '#020617', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraActive && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <video 
                ref={videoRef} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                muted 
                playsInline
              />
              <button 
                className="toggle-btn" 
                style={{ 
                  position: 'absolute', 
                  bottom: '16px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  padding: '10px 20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
                onClick={captureSnapshot}
              >
                📸 Capture Still Frame
              </button>
            </div>
          )}

          {image && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img 
                src={image} 
                alt="Upload preview" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
              {loading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(2, 6, 23, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  {/* Glowing Laser Scan Bar */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(to right, transparent, var(--teal), var(--sky), var(--teal), transparent)',
                    boxShadow: '0 0 16px var(--teal)',
                    top: '0%',
                    animation: 'scan-laser 2s linear infinite'
                  }} />
                </div>
              )}
            </div>
          )}

          {!cameraActive && !image && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '24px' }}>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</p>
              <p>Upload a file or start camera to capture an image</p>
            </div>
          )}
        </div>

        {/* Run Analysis Trigger */}
        {image && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              className="toggle-btn" 
              style={{ 
                padding: '12px 28px', 
                fontSize: '15px', 
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--indigo), #4338ca)',
                borderColor: 'var(--border-bright)'
              }}
              onClick={triggerAnalyze}
            >
              🪄 Run Gemini Coach Analysis
            </button>
          </div>
        )}

        {loading && (
          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            ⏳ Scanning body posture and analyzing stance metrics via Gemini...
          </p>
        )}

        {error && (
          <div className="alert error" style={{ marginTop: '20px' }}>
            <span style={{ marginRight: '8px' }}>⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Structured results display */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="panel" style={{ padding: '20px' }}>
            <p className="panel-title" style={{ fontSize: '14px', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              🧍 Stance & Body Posture
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {result.posture_feedback}
            </p>
          </div>

          <div className="panel" style={{ padding: '20px' }}>
            <p className="panel-title" style={{ fontSize: '14px', color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              😊 Facial Expressions & Warmth
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {result.facial_feedback}
            </p>
          </div>

          <div className="panel" style={{ gridColumn: 'span 2', padding: '20px' }}>
            <p className="panel-title" style={{ fontSize: '14px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              🎯 Actionable Coach Recommendations
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.actionable_tips && result.actionable_tips.map((tip, idx) => (
                <li key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  fontSize: '14px', 
                  color: 'var(--text-primary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--amber)'
                }}>
                  <span style={{ color: 'var(--amber)' }}>✔</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Styled animation keyframes injection */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
