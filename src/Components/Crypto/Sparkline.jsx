import React, { memo, useMemo } from "react";

const MAX_POINTS = 48;

/** 7-day trend line; colored by whether the period ended up or down */
function Sparkline({ data, width = 112, height = 36, className }) {
  const { path, up } = useMemo(() => {
    const raw = Array.isArray(data) ? data.filter(Number.isFinite) : [];
    if (raw.length < 2) return { path: null, up: true };
    // Downsample: 168 hourly points are more detail than 112px can show
    const step = Math.max(1, Math.floor(raw.length / MAX_POINTS));
    const points = raw.filter((_, i) => i % step === 0 || i === raw.length - 1);
    const min = Math.min(...points);
    const range = Math.max(...points) - min || 1;
    const dx = width / (points.length - 1);
    const d = points
      .map((v, i) => `${i ? "L" : "M"}${(i * dx).toFixed(1)},${(height - 2 - ((v - min) / range) * (height - 4)).toFixed(1)}`)
      .join("");
    return { path: d, up: points[points.length - 1] >= points[0] };
  }, [data, width, height]);

  if (!path) return <div style={{ width, height }} className={className} />;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <path d={path} fill="none" strokeWidth="1.5" strokeLinejoin="round" style={{ stroke: up ? "var(--up)" : "var(--down)" }} />
    </svg>
  );
}

export default memo(Sparkline);
