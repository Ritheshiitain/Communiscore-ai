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

const MOCK_INITIAL_REPORTS = [
  {
    id: 1,
    title: 'Executive Pitch Practice',
    date: '2026-07-29',
    duration: '01:00',
    overallScore: 82,
    metrics: { eyeContact: 88, posture: 79, vocalConfidence: 81, dominantEmotion: 'Happiness' },
    timeline: [
      { time: '0:00', eyeContact: 60, posture: 70, emotionScore: 70, vocalConfidence: 65 },
      { time: '0:10', eyeContact: 75, posture: 80, emotionScore: 70, vocalConfidence: 70 },
      { time: '0:20', eyeContact: 90, posture: 82, emotionScore: 90, vocalConfidence: 80 },
      { time: '0:30', eyeContact: 85, posture: 75, emotionScore: 90, vocalConfidence: 85 },
      { time: '0:40', eyeContact: 92, posture: 80, emotionScore: 70, vocalConfidence: 82 },
      { time: '0:50', eyeContact: 88, posture: 78, emotionScore: 90, vocalConfidence: 85 },
      { time: '1:00', eyeContact: 95, posture: 82, emotionScore: 90, vocalConfidence: 80 },
    ],
    tips: [
      '✅ Eye Contact (88%): Outstanding direct camera engagement during key statements.',
      '💡 Posture (79%): Slight forward lean detected; maintain shoulder alignment.',
      '✅ Vocal Confidence (81%): Excellent energy with steady pacing.',
      '🎯 Recommendation to Improve: Keep posture upright during mid-session transitions.'
    ]
  }
];

function generateReportFromTimeline(timelineData) {
  const points = timelineData && timelineData.length > 0 ? timelineData : [];
  
  const avgEyeContact = points.length
    ? Math.round(points.reduce((s, p) => s + (p.eyeContact || 0), 0) / points.length)
    : 76;
  const avgPosture = points.length
    ? Math.round(points.reduce((s, p) => s + (p.posture || 0), 0) / points.length)
    : 78;
  const avgVocal = points.length
    ? Math.round(points.reduce((s, p) => s + (p.vocalConfidence || 0), 0) / points.length)
    : 72;

  const overallScore = Math.min(100, Math.max(35, Math.round(avgEyeContact * 0.35 + avgPosture * 0.35 + avgVocal * 0.30)));

  const tips = [];
  
  // Eye contact analysis
  if (avgEyeContact >= 80) {
    tips.push(`✨ Eye Contact (${avgEyeContact}%): Excellent direct camera contact! Maintained steady audience engagement.`);
  } else if (avgEyeContact >= 60) {
    tips.push(`💡 Eye Contact (${avgEyeContact}%): Good camera focus, but minor gaze drift observed. Look directly at the camera lens.`);
  } else {
    tips.push(`⚠️ Eye Contact (${avgEyeContact}% Needs Improvement): Frequent gaze drift detected. Position camera at eye level and keep steady focus.`);
  }

  // Posture analysis
  if (avgPosture >= 80) {
    tips.push(`✨ Posture Alignment (${avgPosture}/100): Superior head-to-shoulder alignment and steady posture.`);
  } else if (avgPosture >= 65) {
    tips.push(`💡 Posture Alignment (${avgPosture}/100): Moderate stance. Occasional slumping noted in the middle of session.`);
  } else {
    tips.push(`⚠️ Posture Alignment (${avgPosture}/100 Needs Improvement): Forward head tilt/slouching detected. Pull shoulders back and keep core steady.`);
  }

  // Vocal analysis
  if (avgVocal >= 75) {
    tips.push(`✨ Vocal Projection (${avgVocal}%): Clear, confident volume and solid speech rhythm.`);
  } else if (avgVocal >= 55) {
    tips.push(`💡 Vocal Projection (${avgVocal}%): Fair volume, but voice dipped slightly during pauses.`);
  } else {
    tips.push(`⚠️ Vocal Projection (${avgVocal}% Needs Improvement): Low speech energy. Speak louder with deliberate pauses to convey authority.`);
  }

  tips.push(`🎯 Key Recommendation to Improve: Re-run a 1-minute assessment focusing on locked eye contact and an upright posture.`);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];

  return {
    id: Date.now(),
    title: `1-Min Live Assessment (${timeStr})`,
    date: dateStr,
    duration: '01:00',
    overallScore,
    metrics: {
      eyeContact: avgEyeContact,
      posture: avgPosture,
      vocalConfidence: avgVocal,
      dominantEmotion: 'Focused',
    },
    timeline: points.length > 0 ? points : [
      { time: '0:10', eyeContact: 75, posture: 80, emotionScore: 70, vocalConfidence: 65 },
      { time: '0:20', eyeContact: 80, posture: 82, emotionScore: 75, vocalConfidence: 70 },
      { time: '0:30', eyeContact: 85, posture: 85, emotionScore: 80, vocalConfidence: 75 },
      { time: '0:40', eyeContact: 88, posture: 84, emotionScore: 85, vocalConfidence: 78 },
      { time: '0:50', eyeContact: 82, posture: 80, emotionScore: 80, vocalConfidence: 72 },
      { time: '1:00', eyeContact: 90, posture: 85, emotionScore: 85, vocalConfidence: 80 },
    ],
    tips,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isActive, setIsActive] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const { videoRef, canvasRef, metrics, timeline, error, isReady } = useAssessment(isActive, activeTab);
  
  // 1-minute auto session tracking state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [reportsList, setReportsList] = useState(MOCK_INITIAL_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState(MOCK_INITIAL_REPORTS[0].id);
  const [bannerNotice, setBannerNotice] = useState(null);

  // Auto-finish 1-minute session and transfer to Reports
  const finishSessionAndNavigate = (recordedTimeline) => {
    setIsActive(false);
    setSessionSeconds(0);

    const newReport = generateReportFromTimeline(recordedTimeline || timeline);
    setReportsList((prev) => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
    setActiveTab('reports');

    setBannerNotice(`🎉 1-Minute Session Completed! Behavioral timeline chart and improvement analysis transferred to Reports.`);
    setTimeout(() => setBannerNotice(null), 8000);
  };

  // 1-minute countdown interval loop
  useEffect(() => {
    let interval = null;
    if (isActive && isReady) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          const next = prev + 1;
          if (next >= 60) {
            finishSessionAndNavigate(timeline);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isReady, timeline]);

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

  const formattedTimer = `${String(Math.floor(sessionSeconds / 60)).padStart(2, '0')}:${String(sessionSeconds % 60).padStart(2, '0')}`;

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
            Reports {reportsList.length > 0 && `(${reportsList.length})`}
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
            <span className="session-timer" aria-label="Session duration" style={{ color: isActive ? '#6366f1' : 'var(--text-secondary)' }}>
              ⏱ {formattedTimer} / 01:00
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
              {isActive ? 'Pause Analysis' : 'Start 1-Min Assessment'}
            </button>
          )}
        </div>
      </header>

      {/* Global Notification Banner */}
      {bannerNotice && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(34,197,94,0.2) 100%)',
          border: '1px solid var(--border-bright)',
          borderRadius: '10px',
          padding: '14px 20px',
          marginTop: '16px',
          color: 'var(--text-primary)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span>{bannerNotice}</span>
          <button 
            onClick={() => setBannerNotice(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

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
                <div className="panel-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p className="panel-title">Behavioral Timeline</p>
                    <p className="panel-desc">
                      {isActive 
                        ? `⏱ 1-Minute Live Session: ${60 - sessionSeconds}s remaining → Auto-transfers to Reports` 
                        : 'Real-time multi-metric trends — last 60 data points'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isActive && (
                      <button 
                        onClick={() => finishSessionAndNavigate(timeline)}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(99,102,241,0.3)'
                        }}
                      >
                        Finish & View Report ➔
                      </button>
                    )}
                    <span className={`status-pill ${isActive ? 'active' : ''}`} aria-hidden="true">
                      {isActive ? 'Live (Auto-Report @ 60s)' : 'Standby'}
                    </span>
                  </div>
                </div>

                {/* 60-Second Session Countdown Progress Bar */}
                {isActive && (
                  <div style={{ margin: '10px 0', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${(sessionSeconds / 60) * 100}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #6366f1 0%, #22c55e 100%)',
                        transition: 'width 1s linear'
                      }} 
                    />
                  </div>
                )}

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
      {activeTab === 'reports' && (
        <ReportsView 
          reports={reportsList} 
          selectedReportId={selectedReportId} 
          onSelectReport={setSelectedReportId} 
        />
      )}
      {activeTab === 'videos' && <TeachingVideos />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
    </div>
  );
}

