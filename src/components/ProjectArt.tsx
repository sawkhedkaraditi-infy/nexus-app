// Generated SVG illustrations, so the project needs no external image files or licences.
// Swap these for real photos (next/image) if you want.
import type { ReactNode } from 'react';

type Kind = 'Infrastructure' | 'Energy' | 'Utilities & Metals' | 'Realty' | 'Technology' | 'Finance';

const THEME: Record<Kind, { bg: [string, string]; accent: string; soft: string }> = {
  Infrastructure: { bg: ['#16365f', '#0c1c33'], accent: '#ffb23e', soft: '#5d86b8' },
  Energy: { bg: ['#0d3b3a', '#071e24'], accent: '#6ff0b0', soft: '#2f8f84' },
  'Utilities & Metals': { bg: ['#3b2517', '#1a0f0a'], accent: '#ff8a3d', soft: '#9a6a48' },
  Realty: { bg: ['#2a2358', '#120f2b'], accent: '#c7a8ff', soft: '#6d5fb5' },
  Technology: { bg: ['#0e2d52', '#07142a'], accent: '#4fd4ff', soft: '#3a78ad' },
  Finance: { bg: ['#2d3414', '#141a09'], accent: '#ffd84d', soft: '#8a9a3b' },
};

const rnd = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

function Turbine({ x, y, h, s = 1 }: { x: number; y: number; h: number; s?: number }) {
  const hubY = y - h;
  const L = 34 * s;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={hubY} stroke="#dff7ee" strokeWidth={3 * s} strokeLinecap="round" />
      <g className="spin" style={{ transformOrigin: `${x}px ${hubY}px` }}>
        {[0, 120, 240].map((a) => (
          <line
            key={a}
            x1={x}
            y1={hubY}
            x2={r2(x + L * Math.cos((a * Math.PI) / 180))}
            y2={r2(hubY + L * Math.sin((a * Math.PI) / 180))}
            stroke="#ffffff"
            strokeWidth={3 * s}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={x} cy={hubY} r={3.5 * s} fill="#ffffff" />
    </g>
  );
}

export function ProjectArt({ kind, seed = 1, className }: { kind: string; seed?: number; className?: string }) {
  const k = (kind in THEME ? kind : 'Infrastructure') as Kind;
  const t = THEME[k];
  const gid = `pa-${k.replace(/\W/g, '')}-${seed}`;
  let body: ReactNode = null;

  if (k === 'Infrastructure') {
    body = (
      <>
        <circle cx={320 - seed * 6} cy="62" r="26" fill={t.accent} opacity="0.85" />
        <rect y="168" width="400" height="72" fill="#0a1830" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M0 ${184 + i * 14} q 25 -8 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0`} stroke={t.soft} strokeWidth="1.5" fill="none" opacity="0.5" />
        ))}
        <line x1="0" y1="140" x2="400" y2="140" stroke={t.accent} strokeWidth="6" />
        {[110, 290].map((tx) => (
          <g key={tx}>
            <rect x={tx - 5} y="46" width="10" height="124" fill="#d7e3f4" />
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i}>
                <line x1={tx} y1="52" x2={tx - 18 - i * 14} y2="140" stroke="#d7e3f4" strokeWidth="1.2" />
                <line x1={tx} y1="52" x2={tx + 18 + i * 14} y2="140" stroke="#d7e3f4" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        ))}
      </>
    );
  } else if (k === 'Energy') {
    body = (
      <>
        <circle cx={70 + seed * 5} cy="60" r="22" fill={t.accent} opacity="0.7" />
        <path d="M0 190 Q 100 150 200 180 T 400 165 V240 H0Z" fill="#06231f" />
        <Turbine x={95} y={185} h={95} />
        <Turbine x={200} y={178} h={120} s={1.2} />
        <Turbine x={310} y={172} h={85} s={0.9} />
        {Array.from({ length: 6 }).map((_, i) => (
          <polygon key={i} points={`${20 + i * 62},228 ${58 + i * 62},228 ${66 + i * 62},208 ${28 + i * 62},208`} fill="#123f53" stroke={t.accent} strokeWidth="1" />
        ))}
      </>
    );
  } else if (k === 'Utilities & Metals') {
    body = (
      <>
        <rect x="0" y="190" width="400" height="50" fill="#120a06" />
        <rect x="60" y="140" width="190" height="60" fill="#2a1a10" />
        {[90, 140, 190].map((cx, i) => (
          <g key={cx}>
            <rect x={cx} y={70 + i * 10} width="22" height={70 - i * 10} fill="#3f2a1c" />
            {[0, 1, 2].map((j) => (
              <circle key={j} className="smoke" style={{ animationDelay: `${j * 1.1 + i * 0.4}s` }} cx={cx + 11 + j * 6} cy={60 + i * 10} r={9 + j * 3} fill="#cbbba8" opacity="0.35" />
            ))}
          </g>
        ))}
        <rect x="72" y="160" width="40" height="30" fill={t.accent} opacity="0.85" />
        <rect x="170" y="160" width="60" height="12" fill={t.accent} opacity="0.5" />
        <circle cx="320" cy="150" r="42" fill="none" stroke={t.soft} strokeWidth="14" strokeDasharray="10 8" className="spin" style={{ transformOrigin: '320px 150px' }} />
        <circle cx="320" cy="150" r="14" fill={t.accent} />
      </>
    );
  } else if (k === 'Realty') {
    body = (
      <>
        <circle cx={330 - seed * 4} cy="48" r="16" fill="#f1e9ff" opacity="0.9" />
        {Array.from({ length: 7 }).map((_, i) => {
          const w = 40 + Math.floor(rnd(i + seed) * 14);
          const h = 80 + Math.floor(rnd(i + seed + 9) * 100);
          const x = 10 + i * 55;
          return (
            <g key={i}>
              <rect x={x} y={240 - h} width={w} height={h} fill={i % 2 ? '#3a2f78' : '#2c2460'} />
              {Array.from({ length: Math.floor(h / 16) }).map((_, r) =>
                Array.from({ length: Math.floor(w / 12) }).map((_, c) => (
                  <rect key={`${r}-${c}`} x={x + 5 + c * 11} y={240 - h + 6 + r * 16} width="6" height="8" fill={rnd(i * 31 + r * 7 + c + seed) > 0.45 ? t.accent : '#4b3f94'} opacity={rnd(i + r + c) > 0.5 ? 0.95 : 0.55} />
                )),
              )}
            </g>
          );
        })}
      </>
    );
  } else if (k === 'Technology') {
    body = (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i}>
            <rect x={28 + i * 72} y="38" width="58" height="170" rx="4" fill="#0b2342" stroke={t.soft} strokeWidth="1.5" />
            {Array.from({ length: 8 }).map((_, r) => (
              <g key={r}>
                <rect x={34 + i * 72} y={46 + r * 20} width="46" height="12" rx="2" fill="#13335c" />
                <circle className="blink" style={{ animationDelay: `${((i * 8 + r) % 7) * 0.35}s` }} cx={74 + i * 72} cy={52 + r * 20} r="2.5" fill={r % 3 === 0 ? t.accent : '#6ff0b0'} />
              </g>
            ))}
          </g>
        ))}
        <path d="M0 226 H80 L100 212 H220 L240 226 H400" stroke={t.accent} strokeWidth="1.5" fill="none" opacity="0.7" />
      </>
    );
  } else {
    const heights = [40, 62, 55, 84, 98, 118, 140];
    body = (
      <>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="20" x2="380" y1={60 + i * 45} y2={60 + i * 45} stroke={t.soft} strokeWidth="0.8" opacity="0.4" />
        ))}
        {heights.map((h, i) => (
          <rect key={i} x={36 + i * 48} y={210 - h} width="30" height={h} rx="3" fill={t.accent} opacity={0.35 + i * 0.09} />
        ))}
        <polyline points={heights.map((h, i) => `${51 + i * 48},${200 - h - 6}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="352" cy="58" r="24" fill={t.accent} opacity="0.9" />
        <text x="352" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d3414">
          ₹
        </text>
      </>
    );
  }

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`${k} illustration`}>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.bg[0]} />
          <stop offset="1" stopColor={t.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gid}-g)`} />
      {body}
    </svg>
  );
}