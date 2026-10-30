// Deterministic "live" plant simulation. Everything here is SIMULATED dummy data.
// It is a pure function of time, so it works on serverless hosting (no long-lived process needed)
// and every viewer sees the same numbers at the same moment.

export interface PlantDef {
  id: string;
  name: string;
  type: string;
  capacity: number;
  unit: string;
  base: number;
}

export interface PlantReading {
  id: string;
  name: string;
  type: string;
  unit: string;
  capacity: number;
  output: number;
  load: number; // percent
  temp: number;
  status: 'Normal' | 'Warning' | 'Critical';
}

export interface Frame {
  ts: number;
  plants: PlantReading[];
  powerMW: number;
}

export interface LiveAlert {
  id: string;
  ts: number;
  level: 'warning' | 'critical';
  plant: string;
  message: string;
}

const STEP = 2000;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// deterministic hash -> 0..1
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

// smooth value noise -> 0..1
const smooth = (seed: number, x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(seed * 1000 + i) * (1 - u) + hash(seed * 1000 + i + 1) * u;
};

const seedOf = (id: string) => {
  let s = 0;
  for (const ch of id) s += ch.charCodeAt(0);
  return (s % 97) + 1;
};

export function frameAt(plants: PlantDef[], t: number): Frame {
  const b = Math.floor(t / STEP);
  const readings = plants.map((p): PlantReading => {
    const seed = seedOf(p.id);
    let target = p.base;
    if (p.type === 'Solar') target = p.base * (0.75 + 0.25 * Math.sin((b * STEP) / 20000)); // sun-like cycle

    let load = target + (smooth(seed, b / 6) - 0.5) * 0.16 + (hash(seed * 31 + b) - 0.5) * 0.04;
    const dip = hash(seed * 77 + Math.floor(b / 15)) > 0.86 && b % 15 < 5 ? 0.4 : 0; // occasional output dips
    load = clamp(load - dip, 0.05, 1);

    const heat = hash(seed * 131 + Math.floor(b / 20)) > 0.88 && b % 20 < 6 ? 20 : 0; // occasional overheating
    const temp = clamp(52 + load * 38 + (smooth(seed + 5, b / 4) - 0.5) * 8 + heat, 40, 110);

    let status: PlantReading['status'] = 'Normal';
    if (temp > 90 || load < 0.3) status = 'Warning';
    if (temp > 100) status = 'Critical';

    return {
      id: p.id,
      name: p.name,
      type: p.type,
      unit: p.unit,
      capacity: p.capacity,
      output: +(load * p.capacity).toFixed(1),
      load: +(load * 100).toFixed(1),
      temp: +temp.toFixed(1),
      status,
    };
  });

  return {
    ts: b * STEP,
    plants: readings,
    powerMW: +readings.filter((r) => r.unit === 'MW').reduce((s, r) => s + r.output, 0).toFixed(1),
  };
}

export function history(plants: PlantDef[], now: number, count: number): Frame[] {
  const frames: Frame[] = [];
  for (let i = count - 1; i >= 0; i--) frames.push(frameAt(plants, now - i * STEP));
  return frames;
}

// An alert is raised each time a plant moves from Normal into Warning/Critical.
export function deriveAlerts(frames: Frame[]): LiveAlert[] {
  const prev = new Map<string, string>();
  const alerts: LiveAlert[] = [];
  for (const f of frames) {
    for (const p of f.plants) {
      const before = prev.get(p.id);
      if (p.status !== 'Normal' && (before === undefined || before === 'Normal')) {
        alerts.push({
          id: `${f.ts}-${p.id}`,
          ts: f.ts,
          level: p.status === 'Critical' ? 'critical' : 'warning',
          plant: p.name,
          message: p.temp > 90 ? `Temperature at ${Math.round(p.temp)}°C` : `Output dropped to ${Math.round(p.load)}% of capacity`,
        });
      }
      prev.set(p.id, p.status);
    }
  }
  return alerts.reverse().slice(0, 12);
}
