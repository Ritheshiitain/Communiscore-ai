import React, { useState, useEffect, useRef } from 'react';

export default function VrAssessment() {
  const [roomSize, setRoomSize] = useState('boardroom'); // boardroom, auditorium, classroom
  const [temperament, setTemperament] = useState('friendly'); // friendly, neutral, critical
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Simulated VR state metrics
  const [metrics, setMetrics] = useState({
    engagement: 80,
    gazeDistribution: { left: 30, center: 50, right: 20 },
    postureDrift: 1.4,
    boredomRate: 15,
  });

  const canvasRef = useRef(null);

  // Simulation engine
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setMetrics((prev) => {
        // Adjust baseline based on selected room/temperament
        const baseEngagement = temperament === 'friendly' ? 85 : temperament === 'critical' ? 55 : 70;
        const baseBoredom = temperament === 'friendly' ? 10 : temperament === 'critical' ? 30 : 20;

        const jitter = (Math.random() - 0.5) * 6;
        
        // Gaze drifts randomly
        const leftJitter = Math.max(10, Math.min(60, prev.gazeDistribution.left + (Math.random() - 0.5) * 8));
        const rightJitter = Math.max(10, Math.min(60, prev.gazeDistribution.right + (Math.random() - 0.5) * 8));
        const centerJitter = Math.max(20, 100 - leftJitter - rightJitter);

        return {
          engagement: Math.round(Math.max(0, Math.min(100, baseEngagement + jitter))),
          boredomRate: Math.round(Math.max(0, Math.min(100, baseBoredom - jitter / 2))),
          postureDrift: parseFloat((prev.postureDrift + (Math.random() - 0.5) * 0.4).toFixed(1)),
          gazeDistribution: {
            left: Math.round(leftJitter),
            center: Math.round(centerJitter),
            right: Math.round(100 - Math.round(leftJitter) - Math.round(centerJitter)),
          }
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isSimulating, temperament]);

  // Render audience & gaze heatmap on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw virtual stage
      ctx.fillStyle = '#060d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw rows of audience avatars based on roomSize
      const rows = roomSize === 'auditorium' ? 6 : roomSize === 'classroom' ? 4 : 2;
      const cols = roomSize === 'auditorium' ? 12 : roomSize === 'classroom' ? 8 : 4;
      
      const rowSpacing = (canvas.height - 100) / rows;
      const colSpacing = (canvas.width - 80) / cols;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = 40 + c * colSpacing + (r % 2 === 0 ? colSpacing / 4 : 0);
          const y = 80 + r * rowSpacing;

          // Avatar head
          ctx.beginPath();
          ctx.arc(x, y, 10 + r * 1.5, 0, Math.PI * 2);
          
          // Color based on engagement/temperament
          if (temperament === 'friendly') {
            ctx.fillStyle = `rgba(34, 197, 94, ${0.4 + Math.sin(frame * 0.05 + c) * 0.15})`;
          } else if (temperament === 'critical') {
            ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(frame * 0.05 + c) * 0.15})`;
          } else {
            ctx.fillStyle = `rgba(99, 102, 241, ${0.4 + Math.sin(frame * 0.05 + c) * 0.15})`;
          }
          ctx.fill();

          // Avatar shoulders
          ctx.beginPath();
          ctx.ellipse(x, y + 20 + r * 2, 16 + r * 2, 8 + r, 0, 0, Math.PI, true);
          ctx.fill();
        }
      }

      // Draw Speaker's Gaze Heatmap Overlay
      const grad = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(frame * 0.02) * (canvas.width / 3),
        canvas.height / 2 + Math.cos(frame * 0.03) * 60,
        15,
        canvas.width / 2 + Math.sin(frame * 0.02) * (canvas.width / 3),
        canvas.height / 2 + Math.cos(frame * 0.03) * 60,
        120
      );
      grad.addColorStop(0, 'rgba(20, 184, 166, 0.45)');
      grad.addColorStop(0.5, 'rgba(20, 184, 166, 0.18)');
      grad.addColorStop(1, 'rgba(20, 184, 166, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2 + Math.sin(frame * 0.02) * (canvas.width / 3), canvas.height / 2 + Math.cos(frame * 0.03) * 60, 120, 0, Math.PI * 2);
      ctx.fill();

      // Label indicator text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText('SIMULATED VR PERSPECTIVE (SPEAKER FOCUS HEATMAP)', 20, 30);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [roomSize, temperament]);

  return (
    <div className="vr-assessment" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginTop: '20px' }}>
      
      {/* Simulation Screen */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div>
            <p className="panel-title">VR Auditorium Simulator</p>
            <p className="panel-desc">Interactive audience gaze tracker mapping and room focus distribution</p>
          </div>
          <button 
            className="toggle-btn" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative', background: '#020617', borderRadius: '10px', overflow: 'hidden', minHeight: '360px', border: '1px solid var(--border)' }}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Configuration Bar */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>ROOM SIZE</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className={`toggle-btn ${roomSize === 'boardroom' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setRoomSize('boardroom')}
              >
                Boardroom (4 Avatars)
              </button>
              <button 
                className={`toggle-btn ${roomSize === 'classroom' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setRoomSize('classroom')}
              >
                Classroom (32 Avatars)
              </button>
              <button 
                className={`toggle-btn ${roomSize === 'auditorium' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setRoomSize('auditorium')}
              >
                Auditorium (72 Avatars)
              </button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>AUDIENCE DISPOSITION</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className={`toggle-btn ${temperament === 'friendly' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setTemperament('friendly')}
              >
                Friendly (Green)
              </button>
              <button 
                className={`toggle-btn ${temperament === 'neutral' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setTemperament('neutral')}
              >
                Attentive (Indigo)
              </button>
              <button 
                className={`toggle-btn ${temperament === 'critical' ? '' : 'paused'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setTemperament('critical')}
              >
                Critical (Red)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VR Telemetry Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Engagement card */}
        <div className="metric-card glow-indigo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Audience Engagement</span>
            <span className="trend-badge positive">▲ SIMULATED</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--indigo)' }}>{metrics.engagement}%</div>
          <div className="metric-visual">
            <div className="metric-bar-fill" style={{ width: `${metrics.engagement}%`, backgroundColor: 'var(--indigo)' }}></div>
          </div>
          <span className="metric-status" style={{ color: 'var(--text-secondary)' }}>
            Average attention span across the room.
          </span>
        </div>

        {/* Room focus distribution */}
        <div className="panel" style={{ padding: '20px' }}>
          <p className="panel-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Room Focus Split</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Left Stage Zone</span>
                <span>{metrics.gazeDistribution.left}%</span>
              </div>
              <div className="metric-visual" style={{ height: '6px' }}>
                <div className="metric-bar-fill" style={{ width: `${metrics.gazeDistribution.left}%`, backgroundColor: 'var(--teal)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Center Stage Zone</span>
                <span>{metrics.gazeDistribution.center}%</span>
              </div>
              <div className="metric-visual" style={{ height: '6px' }}>
                <div className="metric-bar-fill" style={{ width: `${metrics.gazeDistribution.center}%`, backgroundColor: 'var(--indigo)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Right Stage Zone</span>
                <span>{metrics.gazeDistribution.right}%</span>
              </div>
              <div className="metric-visual" style={{ height: '6px' }}>
                <div className="metric-bar-fill" style={{ width: `${metrics.gazeDistribution.right}%`, backgroundColor: 'var(--amber)' }}></div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', fontFamily: 'var(--font-mono)' }}>
            Goal: Keep Center zone above 40%, Left/Right above 15% each.
          </p>
        </div>

        {/* Audience Boredom Card */}
        <div className="metric-card glow-amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Audience Boredom</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>METER</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--amber)' }}>{metrics.boredomRate}%</div>
          <div className="metric-visual">
            <div className="metric-bar-fill" style={{ width: `${metrics.boredomRate}%`, backgroundColor: 'var(--amber)' }}></div>
          </div>
          <span className="metric-status" style={{ color: 'var(--text-secondary)' }}>
            Percentage of audience showing low head movements.
          </span>
        </div>

      </div>

    </div>
  );
}
