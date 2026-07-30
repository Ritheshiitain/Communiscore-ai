export default function WebcamFeed({ videoRef, isActive, metrics }) {
  return (
    <div className="panel webcam-panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Live Feed</p>
          <p className="panel-desc" style={{ marginBottom: 0 }}>Real-time behavioral analysis capture</p>
        </div>
        <span className={`status-pill ${isActive ? 'active' : ''}`} aria-live="polite">
          {isActive ? 'Analyzing' : 'Standby'}
        </span>
      </div>

      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="webcam-video"
          aria-label="Webcam live feed"
        />
        <div className={`video-overlay ${isActive ? 'active' : ''}`} aria-hidden="true">
          {/* Corner bracket decorations */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />
        </div>

        {/* Live metrics overlay at bottom */}
        {isActive && (
          <div className="video-face-label" aria-hidden="true">
            <span className="face-detected-badge">
              {metrics?.emotion || 'Neutral'} · {Math.round(metrics?.emotionConfidence * 100 || 0)}%
            </span>
            <span className="face-detected-badge" style={{ borderColor: 'rgba(20,184,166,0.4)', color: '#14b8a6' }}>
              Eye: {Math.round(metrics?.eyeContact || 0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
