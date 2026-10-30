// Animated hero illustration: drifting clouds, spinning turbines, a swinging crane and twinkling windows.
// Uses a seeded random function (not Math.random) so server and client render identical markup.
const rnd = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

function Cloud({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <g className="drift" style={{ animationDelay: `${delay}s` }} opacity="0.16" fill="#ffffff">
      <ellipse cx={x} cy={y} rx={46 * s} ry={13 * s} />
      <ellipse cx={x - 26 * s} cy={y + 4 * s} rx={26 * s} ry={10 * s} />
      <ellipse cx={x + 28 * s} cy={y + 5 * s} rx={30 * s} ry={10 * s} />
    </g>
  );
}

function Turbine({ x, y, h }: { x: number; y: number; h: number }) {
  const hubY = y - h;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={hubY} stroke="#cfe8e0" strokeWidth="3" strokeLinecap="round" />
      <g className="spin" style={{ transformOrigin: `${x}px ${hubY}px` }}>
        {[0, 120, 240].map((a) => (
          <line
            key={a}
            x1={x}
            y1={hubY}
            x2={r2(x + 46 * Math.cos((a * Math.PI) / 180))}
            y2={r2(hubY + 46 * Math.sin((a * Math.PI) / 180))}
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={x} cy={hubY} r="4.5" fill="#ffffff" />
    </g>
  );
}

export function Skyline() {
  const buildings = Array.from({ length: 15 }).map((_, i) => ({
    x: 20 + i * 78,
    w: 52 + Math.floor(rnd(i + 3) * 26),
    h: 100 + Math.floor(rnd(i + 11) * 190),
  }));

  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" className="skyline" role="img" aria-label="Animated skyline with a bridge, wind turbines and a crane">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1a38" />
          <stop offset="0.7" stopColor="#1a3a6b" />
          <stop offset="1" stopColor="#f0a24a" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky)" />
      <circle cx="900" cy="300" r="190" fill="url(#sun)" />
      <circle cx="900" cy="300" r="46" fill="#ffd9a0" opacity="0.95" />

      {Array.from({ length: 28 }).map((_, i) => (
        <circle key={i} className="blink" style={{ animationDelay: `${(i % 9) * 0.4}s` }} cx={r2(rnd(i + 40) * 1200)} cy={r2(rnd(i + 80) * 170)} r={r2(rnd(i) * 1.3 + 0.5)} fill="#ffffff" />
      ))}

      <Cloud x={200} y={90} s={1.2} delay={0} />
      <Cloud x={620} y={60} s={0.9} delay={-12} />
      <Cloud x={980} y={120} s={1.1} delay={-25} />

      {/* city */}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={420 - b.h} width={b.w} height={b.h} fill={i % 2 ? '#0e2347' : '#12305c'} />
          {Array.from({ length: Math.floor(b.h / 22) }).map((_, r) =>
            Array.from({ length: Math.floor(b.w / 14) }).map((_, c) => {
              const lit = rnd(i * 53 + r * 7 + c * 3) > 0.55;
              return lit ? (
                <rect key={`${r}-${c}`} className="win" style={{ animationDelay: `${((r + c + i) % 6) * 0.7}s` }} x={b.x + 6 + c * 13} y={420 - b.h + 8 + r * 22} width="7" height="10" fill="#ffd27a" />
              ) : null;
            }),
          )}
        </g>
      ))}

      {/* crane */}
      <g>
        <rect x="560" y="120" width="8" height="300" fill="#ffb23e" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1="560" y1={130 + i * 30} x2="568" y2={150 + i * 30} stroke="#0a1a38" strokeWidth="1.5" />
        ))}
        <g className="swing" style={{ transformOrigin: '564px 118px' }}>
          <line x1="440" y1="118" x2="720" y2="118" stroke="#ffb23e" strokeWidth="6" />
          <line x1="564" y1="118" x2="564" y2="92" stroke="#ffb23e" strokeWidth="5" />
          <line x1="564" y1="92" x2="460" y2="118" stroke="#ffb23e" strokeWidth="1.5" />
          <line x1="564" y1="92" x2="700" y2="118" stroke="#ffb23e" strokeWidth="1.5" />
          <line x1="470" y1="118" x2="470" y2="190" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="460" y="190" width="20" height="14" fill="#ffffff" opacity="0.9" />
        </g>
      </g>

      {/* hills + turbines */}
      <path d="M0 420 V340 Q 150 290 320 330 T 640 320 T 960 335 T 1200 310 V420Z" fill="#071b30" />
      <Turbine x={90} y={338} h={120} />
      <Turbine x={230} y={326} h={150} />
      <Turbine x={1010} y={332} h={130} />
      <Turbine x={1130} y={316} h={160} />

      {/* bridge */}
      <g opacity="0.95">
        <line x1="0" y1="372" x2="1200" y2="372" stroke="#ffb23e" strokeWidth="7" />
        {[300, 900].map((tx) => (
          <g key={tx}>
            <rect x={tx - 6} y="250" width="12" height="172" fill="#e6eefb" />
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={i}>
                <line x1={tx} y1="258" x2={tx - 26 - i * 22} y2="372" stroke="#e6eefb" strokeWidth="1.2" />
                <line x1={tx} y1="258" x2={tx + 26 + i * 22} y2="372" stroke="#e6eefb" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        ))}
      </g>
      <rect y="396" width="1200" height="24" fill="#04101f" />
    </svg>
  );
}