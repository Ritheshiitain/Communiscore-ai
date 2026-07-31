import React, { useState } from 'react';
import TimelineChart from './TimelineChart';

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Executive Pitch Practice',
    date: '2026-07-29',
    duration: '03:45',
    overallScore: 82,
    metrics: { eyeContact: 88, posture: 79, vocalConfidence: 81, dominantEmotion: 'Happiness' },
    timeline: [
      { time: '0:00', eyeContact: 60, posture: 70, emotionScore: 70, vocalConfidence: 65 },
      { time: '0:30', eyeContact: 75, posture: 80, emotionScore: 70, vocalConfidence: 70 },
      { time: '1:00', eyeContact: 90, posture: 82, emotionScore: 90, vocalConfidence: 80 },
      { time: '1:30', eyeContact: 85, posture: 75, emotionScore: 90, vocalConfidence: 85 },
      { time: '2:00', eyeContact: 92, posture: 80, emotionScore: 70, vocalConfidence: 82 },
      { time: '2:30', eyeContact: 88, posture: 78, emotionScore: 90, vocalConfidence: 85 },
      { time: '3:00', eyeContact: 95, posture: 82, emotionScore: 90, vocalConfidence: 80 },
      { time: '3:30', eyeContact: 90, posture: 80, emotionScore: 70, vocalConfidence: 83 },
    ],
    tips: [
      'Outstanding eye contact consistency during slide transitions.',
      'Slight forward lean detected in the middle of the pitch; maintain shoulder alignment.',
      'Excellent vocal energy with moderate pause frequency.'
    ]
  },
  {
    id: 2,
    title: 'Product Demo Rehearsal',
    date: '2026-07-28',
    duration: '05:12',
    overallScore: 74,
    metrics: { eyeContact: 68, posture: 84, vocalConfidence: 70, dominantEmotion: 'Neutral' },
    timeline: [
      { time: '0:00', eyeContact: 50, posture: 80, emotionScore: 70, vocalConfidence: 60 },
      { time: '1:00', eyeContact: 62, posture: 85, emotionScore: 70, vocalConfidence: 65 },
      { time: '2:00', eyeContact: 70, posture: 82, emotionScore: 70, vocalConfidence: 72 },
      { time: '3:00', eyeContact: 65, posture: 86, emotionScore: 70, vocalConfidence: 70 },
      { time: '4:00', eyeContact: 78, posture: 83, emotionScore: 70, vocalConfidence: 75 },
      { time: '5:00', eyeContact: 72, posture: 85, emotionScore: 70, vocalConfidence: 78 },
    ],
    tips: [
      'Gaze patterns indicate reading from notes frequently. Try to look at the screen.',
      'Posture remained exceptionally stable and erect throughout.',
      'Speaking rate was slightly high; introduce deliberate pauses.'
    ]
  },
  {
    id: 3,
    title: 'Behavioral Mock Interview',
    date: '2026-07-26',
    duration: '04:20',
    overallScore: 68,
    metrics: { eyeContact: 58, posture: 64, vocalConfidence: 82, dominantEmotion: 'Sadness' },
    timeline: [
      { time: '0:00', eyeContact: 40, posture: 60, emotionScore: 50, vocalConfidence: 75 },
      { time: '1:00', eyeContact: 52, posture: 62, emotionScore: 35, vocalConfidence: 80 },
      { time: '2:00', eyeContact: 60, posture: 65, emotionScore: 35, vocalConfidence: 85 },
      { time: '3:00', eyeContact: 55, posture: 68, emotionScore: 50, vocalConfidence: 82 },
      { time: '4:00', eyeContact: 65, posture: 65, emotionScore: 70, vocalConfidence: 84 },
    ],
    tips: [
      'Low eye contact at start suggests initial nervousness.',
      'Slumping stance identified; pull shoulders back to project confidence.',
      'Strong, clear vocal delivery with good pitch variance.'
    ]
  }
];

export default function ReportsView({ reports = MOCK_REPORTS, selectedReportId, onSelectReport }) {
  const activeReportId = selectedReportId || (reports.length > 0 ? reports[0].id : MOCK_REPORTS[0].id);
  const selectedReport = reports.find((r) => r.id === activeReportId) || reports[0] || MOCK_REPORTS[0];

  return (
    <div className="reports-view" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginTop: '20px' }}>
      
      {/* Session History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Assessment History ({reports.length})
          </p>
        </div>

        {reports.map((report) => (
          <div 
            key={report.id}
            onClick={() => onSelectReport ? onSelectReport(report.id) : null}
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: selectedReport.id === report.id ? 'var(--bg-card)' : 'rgba(10, 18, 40, 0.4)',
              border: '1px solid',
              borderColor: selectedReport.id === report.id ? 'var(--border-bright)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'var(--t-fast)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{report.title}</span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '700',
                color: report.overallScore >= 80 ? 'var(--green)' : report.overallScore >= 70 ? 'var(--amber)' : 'var(--red)'
              }}>
                {report.overallScore}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <span>📅 {report.date}</span>
              <span>⏱ {report.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Report Details */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
        
        {/* Title / Score Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selectedReport.title}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Completed on {selectedReport.date} • Duration: {selectedReport.duration}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>OVERALL SCORE</span>
            <span style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: selectedReport.overallScore >= 80 ? 'var(--green)' : selectedReport.overallScore >= 70 ? 'var(--amber)' : '#f87171',
              background: 'rgba(255,255,255,0.03)',
              padding: '6px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}>
              {selectedReport.overallScore}<span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-muted)' }}>/100</span>
            </span>
          </div>
        </div>

        {/* Aggregated stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Eye Contact</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--indigo)' }}>{selectedReport.metrics.eyeContact}%</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Posture Index</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--teal)' }}>{selectedReport.metrics.posture}</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Vocal Conf.</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--amber)' }}>{selectedReport.metrics.vocalConfidence}%</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Top Emotion</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--green)', display: 'block', marginTop: '4px' }}>{selectedReport.metrics.dominantEmotion}</span>
          </div>
        </div>

        {/* Selected session chart */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
            📊 Multi-Metric Timeline Progression (Recorded Session)
          </p>
          <div style={{ height: '220px', width: '100%' }}>
            <TimelineChart data={selectedReport.timeline} />
          </div>
        </div>

        {/* Coach Recommendations & Actionable Insights */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💡 AI Behavioral Breakdown — Strengths & What to Improve</span>
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedReport.tips.map((tip, idx) => {
              const isPositive = tip.includes('✅') || tip.includes('✨') || tip.includes('Outstanding') || tip.includes('Excellent');
              const isWarning = tip.includes('⚠️') || tip.includes('Improve') || tip.includes('Needs Improvement');
              return (
                <li key={idx} style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-primary)', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px',
                  background: isPositive ? 'rgba(34, 197, 94, 0.06)' : isWarning ? 'rgba(239, 68, 68, 0.06)' : 'rgba(99, 102, 241, 0.06)',
                  borderLeft: `4px solid ${isPositive ? 'var(--green)' : isWarning ? '#f87171' : 'var(--indigo)'}`,
                  padding: '12px 16px',
                  borderRadius: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  lineHeight: '1.5'
                }}>
                  <span>{tip}</span>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

    </div>
  );
}

