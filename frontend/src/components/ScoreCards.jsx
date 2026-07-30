import ScoreCard from './ScoreCard';

const EMOTION_COLORS = {
  Happiness: '#22c55e',
  Neutral:   '#94a3b8',
  Surprise:  '#38bdf8',
  Anger:     '#ef4444',
  Contempt:  '#f97316',
  Disgust:   '#a855f7',
  Fear:      '#6366f1',
  Sadness:   '#3b82f6',
};

export default function ScoreCards({ metrics }) {
  const emotionColor = EMOTION_COLORS[metrics.emotion] || '#94a3b8';
  const sortedScores = Object.entries(metrics.emotionScores || {}).sort((a, b) => b[1] - a[1]);
  const confidencePct = Math.round((metrics.emotionConfidence || 0) * 100);

  return (
    <section className="score-grid" aria-label="Live behavioral metrics">
      {/* Eye Contact */}
      <ScoreCard
        id="eye-contact"
        title="Eye Contact"
        value={`${Math.round(metrics.eyeContact)}%`}
        subtitle="Gaze alignment with camera lens"
        accent="#6366f1"
        progress={metrics.eyeContact}
      />

      {/* Posture */}
      <ScoreCard
        id="posture"
        title="Posture Score"
        value={`${Math.round(metrics.posture)}`}
        subtitle="Shoulder & spine alignment index"
        accent="#14b8a6"
        progress={metrics.posture}
      />

      {/* Facial Emotion */}
      <article className="emotion-card" aria-labelledby="emotion-title">
        <div className="score-card-header">
          <span id="emotion-title" className="score-label">Facial Emotion</span>
          <span
            className="emotion-badge"
            style={{ background: emotionColor }}
            aria-label={`Detected emotion: ${metrics.emotion}`}
          >
            {metrics.emotion}
          </span>
        </div>
        <p className="emotion-confidence">
          Confidence: <strong style={{ color: emotionColor }}>{confidencePct}%</strong>
        </p>
        <div className="emotion-bars" role="list">
          {sortedScores.slice(0, 6).map(([label, score]) => (
            <div key={label} className="emotion-bar-row" role="listitem">
              <span className="emotion-bar-label">{label}</span>
              <div
                className="emotion-bar-track"
                role="progressbar"
                aria-valuenow={Math.round(score * 100)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`${label} score`}
              >
                <div
                  className="emotion-bar-fill"
                  style={{
                    width: `${Math.min(score * 100, 100)}%`,
                    background: EMOTION_COLORS[label] || '#64748b',
                    boxShadow: label === metrics.emotion ? `0 0 6px ${emotionColor}` : 'none',
                  }}
                />
              </div>
              <span className="emotion-bar-value">{(score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </article>

      {/* Vocal Confidence */}
      <ScoreCard
        id="vocal-confidence"
        title="Vocal Confidence"
        value={`${Math.round(metrics.vocalConfidence)}%`}
        subtitle={`Voice tone detected: ${metrics.voiceEmotion}`}
        accent="#f59e0b"
        progress={metrics.vocalConfidence}
      />
    </section>
  );
}
