import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const LINES = [
  { key: 'eyeContact',      name: 'Eye Contact %',     color: '#6366f1' },
  { key: 'posture',         name: 'Posture Score',      color: '#14b8a6' },
  { key: 'emotionScore',    name: 'Emotion Score',      color: '#22c55e' },
  { key: 'vocalConfidence', name: 'Vocal Confidence %', color: '#f59e0b' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(6, 13, 26, 0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 12,
        fontFamily: "'Fira Code', monospace",
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: '#8b9dc3', marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: entry.color }}>
          <span>{entry.name}</span>
          <strong>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function TimelineChart({ data }) {
  if (!data.length) {
    return (
      <div className="chart-empty" role="status" aria-label="Timeline chart — waiting for data">
        <svg className="chart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span>Timeline will appear once analysis starts…</span>
      </div>
    );
  }

  return (
    <div className="chart-container" role="img" aria-label="Behavioral metrics timeline chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 4" stroke="rgba(56,89,163,0.15)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="transparent"
            tick={{ fill: '#475575', fontSize: 10, fontFamily: "'Fira Code', monospace" }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="transparent"
            tick={{ fill: '#475575', fontSize: 10, fontFamily: "'Fira Code', monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine y={50} stroke="rgba(99,102,241,0.12)" strokeDasharray="4 4" />
          <ReferenceLine y={75} stroke="rgba(34,197,94,0.1)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#475575', fontSize: 11, fontFamily: "'Fira Code', monospace", paddingTop: 12 }}
            iconType="circle"
            iconSize={7}
          />
          {LINES.map(({ key, name, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'rgba(0,0,0,0.5)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
