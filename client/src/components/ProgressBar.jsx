import React from 'react';

export default function ProgressBar({ value = 0, color, label, showPercent = true, height = 7 }) {
  const getColor = (v) => {
    if (color) return color;
    if (v >= 80) return 'var(--matched)';
    if (v >= 60) return 'var(--brand-primary)';
    if (v >= 40) return 'var(--gap)';
    return 'var(--deficit)';
  };

  const c = getColor(value);

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
          {label && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
          {showPercent && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: c,
          }}
        />
      </div>
    </div>
  );
}
