import { useEffect, useRef } from 'react';

export default function ScoreRing({ score = 0, size = 150, label = 'Match Score', color }) {
  const circleRef = useRef(null);
  const radius = (size - 18) / 2;
  const circumference = 2 * Math.PI * radius;

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return '#8b5cf6';
    if (score >= 60) return '#7c3aed';
    if (score >= 40) return '#c084fc';
    return '#ef4444';
  };

  const getStatusText = () => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Moderate Match';
    if (score >= 40) return 'Partial Gap';
    return 'Significant Gaps';
  };

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (score / 100) * circumference;
    circleRef.current.style.strokeDashoffset = offset;
  }, [score, circumference]);

  const ringColor = getColor();

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="8"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 8px' }}>
        <div style={{
          fontSize: size > 130 ? '2.1rem' : '1.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: ringColor,
          lineHeight: 1,
        }}>
          {score}%
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.72rem', color: ringColor, fontWeight: 600, marginTop: 2 }}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}
