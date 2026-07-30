import React from 'react';

export default function DashboardOverview({ setActiveTab }) {
  return (
    <div className="dashboard-overview" style={{ maxWidth: '1100px', margin: '20px auto 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Welcome Panel */}
      <div className="panel" style={{ 
        padding: '36px', 
        background: 'linear-gradient(135deg, rgba(10, 18, 40, 0.9) 0%, rgba(6, 13, 26, 0.95) 100%)',
        border: '1px solid var(--border-bright)',
        boxShadow: 'var(--shadow-glow-indigo)',
        borderRadius: '20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decorative spheres */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <span style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          fontFamily: 'var(--font-mono)', 
          color: 'var(--sky)', 
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'rgba(56, 189, 248, 0.08)',
          padding: '6px 14px',
          borderRadius: '999px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '16px'
        }}>
          💡 NEXT-GEN SPEECH INTELLIGENCE
        </span>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '12px' }}>
          Welcome to CommuniScore-AI
        </h1>
        
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Analyze and optimize your public speaking presence. Our platform uses low-latency local machine learning models alongside Google Gemini to grade eye contact, standing posture, facial expressions, and vocal confidence in real-time.
        </p>

        {/* Hero Quick Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            className="toggle-btn"
            style={{ 
              padding: '12px 28px', 
              fontSize: '14px', 
              fontWeight: '600',
              background: 'linear-gradient(135deg, var(--indigo), #4338ca)',
              borderColor: 'var(--border-bright)'
            }}
            onClick={() => setActiveTab('vr')}
          >
            🎙 Start VR Live Assessment
          </button>
          
          <button 
            className="toggle-btn paused"
            style={{ padding: '12px 28px', fontSize: '14px', border: '1px solid var(--border)' }}
            onClick={() => setActiveTab('ai')}
          >
            ✨ Run Gemini Stance Coach
          </button>
        </div>
      </div>

      {/* Feature Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* VR card */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '24px' }}>🎥</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Live VR Assessment</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
            Run real-time webcam session. Grades your gaze alignment, shoulder balance posture, emotion scores, and speech pacing.
          </p>
          <button 
            className="toggle-btn paused" 
            style={{ padding: '6px 12px', fontSize: '11px', width: 'fit-content', marginTop: '10px' }}
            onClick={() => setActiveTab('vr')}
          >
            Launch Live Feed →
          </button>
        </div>

        {/* AI card */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '24px' }}>🪄</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Gemini AI Coach</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
            Take snapshots or upload stance images to receive structured coaching tips and micro-expression highlights using Google Gemini 1.5 Flash.
          </p>
          <button 
            className="toggle-btn paused" 
            style={{ padding: '6px 12px', fontSize: '11px', width: 'fit-content', marginTop: '10px' }}
            onClick={() => setActiveTab('ai')}
          >
            Open Upload Panel →
          </button>
        </div>

        {/* Reports card */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Performance Reports</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
            Access session history logs. Evaluate score progression curves on interactive timeline charts to track performance improvements.
          </p>
          <button 
            className="toggle-btn paused" 
            style={{ padding: '6px 12px', fontSize: '11px', width: 'fit-content', marginTop: '10px' }}
            onClick={() => setActiveTab('reports')}
          >
            Check History Logs →
          </button>
        </div>

      </div>

    </div>
  );
}
