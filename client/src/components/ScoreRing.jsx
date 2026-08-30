import { useEffect, useRef } from 'react';

export default function ScoreRing({ score = 0, size = 160, label = 'Match Score', color }) {
  const circleRef = useRef(null);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return '#00e5a0';
    if (score >= 60) return '#00d4ff';
    if (score >= 40) return '#ffb347';
    return '#ff4d6d';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
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
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />
        {/* Animated fill */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${ringColor}88)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{
          fontSize: size > 120 ? '2rem' : '1.4rem',
          fontWeight: 800,
          color: ringColor,
          lineHeight: 1,
          textShadow: `0 0 20px ${ringColor}66`,
        }}>
          {score}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.7rem', color: ringColor, fontWeight: 600, marginTop: 2 }}>
          {getLabel()}
        </div>
      </div>
    </div>
  );
}
