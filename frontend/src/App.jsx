import { useEffect, useRef, useState } from 'react';
import { checkHealth } from './api/client';
import { useAssessment } from './hooks/useAssessment';
import ScoreCards from './components/ScoreCards';
import TimelineChart from './components/TimelineChart';
import WebcamFeed from './components/WebcamFeed';

// Tab Views
import DashboardOverview from './components/DashboardOverview';
import AiAssessment from './components/AiAssessment';
import ReportsView from './components/ReportsView';
import TeachingVideos from './components/TeachingVideos';
import SettingsView from './components/SettingsView';

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79 2.5 2.5 0 0 1-2-2.25 2.5 2.5 0 0 1 3-2.45V8.5A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79 2.5 2.5 0 0 0 2-2.25 2.5 2.5 0 0 0-3-2.45V8.5A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  );
}

function useSessionTimer(isActive) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to landing dashboard overview page!
  const [isActive, setIsActive] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const { videoRef, canvasRef, metrics, timeline, error, isReady } = useAssessment(isActive, activeTab);
  const sessionTime = useSessionTimer(isActive && isReady);

  useEffect(() => {
    async function pollHealth() {
      const ok = await checkHealth().catch(() => false);
      setBackendOnline(ok);
    }
    pollHealth();
    const timer = setInterval(pollHealth, 10_000);
    return () => clearInterval(timer);
  }, []);

  /* ── Interactive Cursor spotlight glow coordinates tracker ── */
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const targets = document.querySelectorAll('.nav-link, .toggle-btn, .score-card, .emotion-card, .team-watermark');
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const distanceX = Math.abs((rect.left + rect.width / 2) - e.clientX);
        const distanceY = Math.abs((rect.top + rect.height / 2) - e.clientY);
        
        // Only run math if cursor is within active range
        if (distanceX < 240 && distanceY < 240) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--mouse-x', `${x}px`);
          target.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Aggregate session stats from timeline
  const avgEyeContact = timeline.length
    ? Math.round(timeline.reduce((s, p) => s + p.eyeContact, 0) / timeline.length)
    : 0;
  const avgPosture = timeline.length
    ? Math.round(timeline.reduce((s, p) => s + p.posture, 0) / timeline.length)
    : 0;
  const avgVocal = timeline.length
    ? Math.round(timeline.reduce((s, p) => s + (p.vocalConfidence || 0), 0) / timeline.length)
    : 0;
  const peakEmotion = metrics.emotion;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo" aria-hidden="true">
            <BrainIcon />
          </div>
          <div className="brand-text">
            <span className="brand-name">CommuniScore-AI</span>
            <span className="brand-tagline">AI Behavioral Intelligence</span>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <nav className="header-nav">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'vr' ? 'active' : ''}`}
            onClick={() => setActiveTab('vr')}
          >
            VR Assessment
          </button>
          <button 
            className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            AI Assessment
          </button>
          <button 
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button 
            className={`nav-link ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Teaching Videos
          </button>
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>

        {/* Header Actions with team watermark */}
        <div className="header-actions">
          {/* Team Watermark Badge */}
          <span className="team-watermark" title="Hackathon Team Development Group">
            TechNova
          </span>

          {activeTab === 'vr' && isReady && (
            <span className="session-timer" aria-label="Session duration">
              ⏱ {sessionTime}
            </span>
          )}
          <span
            className={`backend-status ${backendOnline === true ? 'online' : backendOnline === false ? 'offline' : ''}`}
            role="status"
            aria-live="polite"
          >
            {backendOnline === null ? 'API...' : backendOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          
          {activeTab === 'vr' && (
            <button
              id="toggle-analysis-btn"
              type="button"
              className={`toggle-btn ${!isActive ? 'paused' : ''}`}
              onClick={() => {
                setIsActive((v) => !v);
              }}
              aria-pressed={isActive}
            >
              {isActive ? <PauseIcon /> : <PlayIcon />}
              {isActive ? 'Pause Analysis' : 'Start Analysis'}
            </button>
          )}
        </div>
      </header>

      {/* ── Content Router ── */}
      {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}

      {activeTab === 'vr' && (
        <>
          {/* Alerts */}
          {error && (
            <div className="alert error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          {!isReady && !error && (
            <div className="alert info" role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Initializing webcam and microphone access...
            </div>
          )}

          {/* Session Stats Bar */}
          <div className="stats-bar" role="region" aria-label="Session statistics">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#6366f1' }}>{avgEyeContact}%</div>
              <div className="stat-label">Avg Eye Contact</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#14b8a6' }}>{avgPosture}</div>
              <div className="stat-label">Avg Posture</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#f59e0b' }}>{avgVocal}%</div>
              <div className="stat-label">Avg Vocal Conf.</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#22c55e', fontSize: '1.15rem' }}>{peakEmotion}</div>
              <div className="stat-label">Current Emotion</div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <main className="dashboard" role="main" style={{ marginTop: '20px' }}>
            <section className="left-column">
              <WebcamFeed videoRef={videoRef} isActive={isActive} metrics={metrics} />
              <div className="panel timeline-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-title">Behavioral Timeline</p>
                    <p className="panel-desc">Real-time multi-metric trends — last 60 data points</p>
                  </div>
                  <span className="status-pill active" aria-hidden="true">Live</span>
                </div>
                <TimelineChart data={timeline} />
              </div>
            </section>

            <section className="right-column" aria-label="Live metrics">
              <ScoreCards metrics={metrics} />
            </section>
          </main>
        </>
      )}

      {activeTab === 'ai' && <AiAssessment />}
      {activeTab === 'reports' && <ReportsView />}
      {activeTab === 'videos' && <TeachingVideos />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
    </div>
  );
}
