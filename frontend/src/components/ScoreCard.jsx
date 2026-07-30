function getScoreLevel(value) {
  if (value >= 75) return { label: 'Excellent', delta: 'positive' };
  if (value >= 50) return { label: 'Good', delta: 'neutral' };
  if (value >= 25) return { label: 'Fair', delta: 'neutral' };
  return { label: 'Low', delta: 'negative' };
}

export default function ScoreCard({ id, title, value, subtitle, accent, progress }) {
  const level = getScoreLevel(progress);
  return (
    <article className="score-card" aria-labelledby={`${id}-title`}>
      <div className="score-card-header">
        <span id={`${id}-title`} className="score-label">{title}</span>
        <span className={`score-delta ${level.delta}`}>{level.label}</span>
      </div>
      <div className="score-row">
        <span className="score-value" style={{ color: accent }}>{value}</span>
      </div>
      <p className="score-subtitle">{subtitle}</p>
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            boxShadow: `0 0 8px ${accent}55`,
          }}
        />
      </div>
    </article>
  );
}
