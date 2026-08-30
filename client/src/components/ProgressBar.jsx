export default function ProgressBar({ value = 0, color, label, showPercent = true, height = 8 }) {
  const getColor = (v) => {
    if (color) return color;
    if (v >= 80) return 'var(--success)';
    if (v >= 60) return 'var(--info)';
    if (v >= 40) return 'var(--warning)';
    return 'var(--error)';
  };

  const c = getColor(value);

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
          {label && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
          {showPercent && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: c }}>{Math.round(value)}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: `linear-gradient(90deg, ${c}aa, ${c})`,
            boxShadow: `0 0 8px ${c}66`,
          }}
        />
      </div>
    </div>
  );
}
