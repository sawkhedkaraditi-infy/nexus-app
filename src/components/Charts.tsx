// Tiny dependency-free SVG charts.
import type { ReactNode } from 'react';

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function LineChart({
  series,
  height = 220,
  unit = '',
  area = false,
  yMin,
  yMax,
}: {
  series: Series[];
  height?: number;
  unit?: string;
  area?: boolean;
  yMin?: number;
  yMax?: number;
}) {
  const W = 640;
  const padL = 46;
  const padR = 12;
  const padT = 12;
  const padB = 22;
  const all = series.flatMap((s) => s.values);
  const lo = yMin ?? Math.floor(Math.min(...all, 0) / 10) * 10;
  const hi = yMax ?? Math.ceil(Math.max(...all, 1) / 10) * 10;
  const n = Math.max(...series.map((s) => s.values.length), 2);
  const x = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo || 1)) * (height - padT - padB);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => lo + f * (hi - lo));

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart" role="img" aria-label="Line chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="chart-grid" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="chart-label">
            {Math.round(t)}
            {unit}
          </text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
        return (
          <g key={s.name}>
            {area && si === 0 && (
              <polygon points={`${x(0)},${y(lo)} ${pts.join(' ')} ${x(s.values.length - 1)},${y(lo)}`} fill={s.color} opacity="0.14" />
            )}
            <polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="legend">
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function Donut({
  parts,
  size = 170,
  stroke = 26,
  center,
}: {
  parts: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
  center?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  let offset = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {parts.map((p) => {
            const len = (p.value / total) * c;
            const el = (
              <circle
                key={p.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="donut-center">{center}</div>
    </div>
  );
}

// Horizontal paired bars, e.g. budget vs spent per vertical.
export function PairBars({
  rows,
  aLabel,
  bLabel,
  format,
}: {
  rows: { label: string; a: number; b: number }[];
  aLabel: string;
  bLabel: string;
  format: (n: number) => string;
}) {
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  return (
    <div className="pairbars">
      {rows.map((r) => (
        <div key={r.label} className="pairbar">
          <div className="pairbar-head">
            <span>{r.label}</span>
            <span className="muted">
              {format(r.b)} / {format(r.a)}
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill a" style={{ width: `${(r.a / max) * 100}%` }} title={`${aLabel}: ${format(r.a)}`} />
          </div>
          <div className="bar-track">
            <div className="bar-fill b" style={{ width: `${(r.b / max) * 100}%` }} title={`${bLabel}: ${format(r.b)}`} />
          </div>
        </div>
      ))}
      <Legend items={[{ label: aLabel, color: 'var(--blue)' }, { label: bLabel, color: 'var(--amber)' }]} />
    </div>
  );
}
