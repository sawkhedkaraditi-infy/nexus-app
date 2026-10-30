'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import type { LiveDto } from '@/lib/types';
import { clock } from '@/lib/format';
import { Legend, LineChart } from '@/components/Charts';

const COLORS = ['#4fd4ff', '#6ff0b0', '#ffb23e', '#c7a8ff'];

export default function LivePage() {
  const [data, setData] = useState<LiveDto | null>(null);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);

  // The browser polls the API every 2 seconds (serverless hosting cannot keep WebSocket connections open).
  useEffect(() => {
    if (paused) return;
    let alive = true;
    async function load() {
      try {
        const d = await api<LiveDto>('/api/live');
        if (alive) {
          setData(d);
          setError('');
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Connection lost');
      }
    }
    load();
    const id = setInterval(load, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [paused]);

  const latest = data ? data.frames[data.frames.length - 1] : null;
  const plantNames = latest ? latest.plants.map((p) => p.name) : [];
  const warnings = latest ? latest.plants.filter((p) => p.status !== 'Normal').length : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Live Operations</h1>
          <p className="muted">Simulated plant telemetry refreshed every 2 seconds. No real plant data is used.</p>
        </div>
        <div className="head-actions">
          <span className={`live-badge${paused || error ? ' off' : ''}`}>
            <i /> {error ? 'Disconnected' : paused ? 'Paused' : 'Live'}
            {latest && !paused && !error ? ` · ${clock(latest.ts)}` : ''}
          </span>
          <button className="btn ghost small" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
        </div>
      </div>

      {error && <div className="alert-box" role="alert">{error}</div>}
      {!data && !error && <div className="card muted">Connecting…</div>}

      {data && latest && (
        <>
          <div className="kpis">
            <div className="kpi"><span className="kpi-label">Grid power (MW plants)</span><span className="kpi-value">{latest.powerMW.toFixed(1)} <span className="muted">MW</span></span></div>
            <div className="kpi"><span className="kpi-label">Plants needing attention</span><span className={`kpi-value ${warnings ? 'warn' : ''}`}>{warnings}</span></div>
            <div className="kpi"><span className="kpi-label">Alerts (last 10 min)</span><span className="kpi-value">{data.alerts.length}</span></div>
          </div>

          <div className="plant-grid">
            {latest.plants.map((p, i) => (
              <div key={p.id} className={`card plant st-${p.status.toLowerCase()}`}>
                <div className="plant-top">
                  <div>
                    <span className="muted small-text">{p.type}</span>
                    <h3>{p.name}</h3>
                  </div>
                  <span className={`badge pl-${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
                <div className="plant-output">
                  {p.output.toFixed(1)} <span className="muted">{p.unit}</span>
                </div>
                <div className="progress"><span style={{ width: `${p.load}%`, background: COLORS[i % COLORS.length] }} /></div>
                <div className="proj-foot"><span>{p.load.toFixed(0)}% of {p.capacity} {p.unit}</span><span className={p.temp > 90 ? 'hot' : 'muted'}>{p.temp.toFixed(0)}°C</span></div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <section className="card">
              <h2 className="card-title">Grid power output (MW)</h2>
              <LineChart series={[{ name: 'MW', color: '#4fd4ff', values: data.frames.map((f) => f.powerMW) }]} area unit="" />
            </section>
            <section className="card">
              <h2 className="card-title">Load by plant (% of capacity)</h2>
              <LineChart
                yMin={0}
                yMax={100}
                unit="%"
                series={plantNames.map((name, i) => ({ name, color: COLORS[i % COLORS.length], values: data.frames.map((f) => f.plants[i].load) }))}
              />
              <Legend items={plantNames.map((name, i) => ({ label: name, color: COLORS[i % COLORS.length] }))} />
            </section>
          </div>

          <section className="card">
            <h2 className="card-title">Alerts</h2>
            {data.alerts.length === 0 ? (
              <p className="muted">All systems normal.</p>
            ) : (
              <ul className="alerts">
                {data.alerts.map((a) => (
                  <li key={a.id} className={`al-${a.level}`}>
                    <span className="al-dot" />
                    <strong>{a.plant}</strong>
                    <span>{a.message}</span>
                    <span className="muted small-text">{clock(a.ts)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
