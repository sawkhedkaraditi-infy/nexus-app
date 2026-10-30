'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/client';
import type { ProjectDto } from '@/lib/types';
import { crore, shortDate } from '@/lib/format';
import { PairBars } from '@/components/Charts';
import { ProjectArt } from '@/components/ProjectArt';
import { Icon } from '@/components/Icon';

const VERTICALS = ['Infrastructure', 'Energy', 'Utilities & Metals', 'Realty', 'Technology'];
const STATUSES = ['Planning', 'On Track', 'At Risk', 'Delayed', 'Completed'];
const statusClass = (s: string) => 'st-' + s.toLowerCase().replace(/\s+/g, '-');

export default function TrackerPage() {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vertical, setVertical] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    api<ProjectDto[]>('/api/projects')
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!vertical || p.vertical === vertical) &&
          (!status || p.status === status) &&
          (!q || `${p.name} ${p.city}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [projects, vertical, status, q],
  );

  const stats = useMemo(() => {
    const budget = filtered.reduce((s, p) => s + p.budget, 0);
    const spent = filtered.reduce((s, p) => s + p.spent, 0);
    const avg = filtered.length ? Math.round(filtered.reduce((s, p) => s + p.progress, 0) / filtered.length) : 0;
    const risky = filtered.filter((p) => p.status === 'At Risk' || p.status === 'Delayed').length;
    return { budget, spent, avg, risky };
  }, [filtered]);

  const byVertical = useMemo(() => {
    const map = new Map<string, { a: number; b: number }>();
    filtered.forEach((p) => {
      const cur = map.get(p.vertical) ?? { a: 0, b: 0 };
      cur.a += p.budget;
      cur.b += p.spent;
      map.set(p.vertical, cur);
    });
    return [...map.entries()].map(([label, v]) => ({ label, ...v }));
  }, [filtered]);

  const range = useMemo(() => {
    if (!filtered.length) return null;
    const min = Math.min(...filtered.map((p) => new Date(p.start).getTime()));
    const max = Math.max(...filtered.map((p) => new Date(p.end).getTime()));
    return { min, max, span: max - min || 1 };
  }, [filtered]);

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  function replaceProject(updated: ProjectDto) {
    setProjects((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function toggleMilestone(p: ProjectDto, mid: number, done: boolean) {
    try {
      replaceProject(await api<ProjectDto>(`/api/projects/${p.id}/milestones/${mid}`, { method: 'PATCH', body: JSON.stringify({ done }) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update milestone');
    }
  }

  const pct = (t: number) => (range ? ((t - range.min) / range.span) * 100 : 0);
  const todayPct = range ? pct(Date.now()) : -1;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Project Tracker</h1>
          <p className="muted">Dummy projects across all verticals. Tick milestones to see progress and status update.</p>
        </div>
        <button className="btn primary" onClick={() => setShowNew(true)}>
          <Icon name="plus" size={16} /> New project
        </button>
      </div>

      {error && <div className="alert-box" role="alert">{error}</div>}

      <div className="filters">
        <input placeholder="Search by name or city" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={vertical} onChange={(e) => setVertical(e.target.value)}>
          <option value="">All verticals</option>
          {VERTICALS.map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="kpis">
        <div className="kpi"><span className="kpi-label">Projects</span><span className="kpi-value">{filtered.length}</span></div>
        <div className="kpi"><span className="kpi-label">Average progress</span><span className="kpi-value">{stats.avg}%</span></div>
        <div className="kpi"><span className="kpi-label">Budget vs spent</span><span className="kpi-value small">{crore(stats.spent)} <span className="muted">of {crore(stats.budget)}</span></span></div>
        <div className="kpi"><span className="kpi-label">At risk or delayed</span><span className="kpi-value warn">{stats.risky}</span></div>
      </div>

      {loading ? (
        <div className="card muted">Loading projects…</div>
      ) : (
        <>
          <div className="grid-2">
            <section className="card">
              <h2 className="card-title">Timeline</h2>
              {range ? (
                <div className="gantt">
                  {filtered.map((p) => (
                    <div key={p.id} className="gantt-row" onClick={() => setSelectedId(p.id)} title="Open details">
                      <div className="gantt-label">{p.name}</div>
                      <div className="gantt-track">
                        <div className={`gantt-bar ${statusClass(p.status)}`} style={{ left: `${pct(new Date(p.start).getTime())}%`, width: `${Math.max(2, pct(new Date(p.end).getTime()) - pct(new Date(p.start).getTime()))}%` }}>
                          <div className="gantt-fill" style={{ width: `${p.progress}%` }} />
                        </div>
                        {todayPct >= 0 && todayPct <= 100 && <div className="gantt-today" style={{ left: `${todayPct}%` }} />}
                      </div>
                    </div>
                  ))}
                  <div className="gantt-axis"><span>{shortDate(new Date(range.min).toISOString())}</span><span>Today marker shown as a line</span><span>{shortDate(new Date(range.max).toISOString())}</span></div>
                </div>
              ) : (
                <p className="muted">No projects match the filters.</p>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Budget vs actual by vertical</h2>
              <PairBars rows={byVertical} aLabel="Budget" bLabel="Spent" format={crore} />
            </section>
          </div>

          <div className="proj-grid">
            {filtered.map((p) => (
              <button key={p.id} className="proj-card" onClick={() => setSelectedId(p.id)}>
                <ProjectArt kind={p.vertical} seed={p.id} className="proj-art" />
                <div className="proj-body">
                  <div className="proj-top">
                    <span className="muted small-text">{p.vertical} · {p.city}</span>
                    <span className={`badge ${statusClass(p.status)}`}>{p.status}</span>
                  </div>
                  <h3>{p.name}</h3>
                  <div className="progress"><span style={{ width: `${p.progress}%` }} /></div>
                  <div className="proj-foot"><span>{p.progress}% complete</span><span className="muted">{crore(p.spent)} / {crore(p.budget)}</span></div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelectedId(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setSelectedId(null)} aria-label="Close"><Icon name="x" /></button>
            <ProjectArt kind={selected.vertical} seed={selected.id} className="drawer-art" />
            <h2>{selected.name}</h2>
            <p className="muted">{selected.description}</p>
            <div className="drawer-meta">
              <span className={`badge ${statusClass(selected.status)}`}>{selected.status}</span>
              <span>{selected.vertical}</span>
              <span>{selected.city}</span>
              <span>Manager: {selected.manager}</span>
            </div>
            <div className="drawer-meta"><span>{shortDate(selected.start)} → {shortDate(selected.end)}</span></div>
            <div className="progress big"><span style={{ width: `${selected.progress}%` }} /></div>
            <p className="muted">{selected.progress}% complete · {crore(selected.spent)} spent of {crore(selected.budget)} ({Math.round((selected.spent / selected.budget) * 100)}%)</p>

            <h3>Milestones</h3>
            <ul className="ms-list">
              {selected.milestones.map((m) => (
                <li key={m.id} className={m.done ? 'done' : ''}>
                  <label>
                    <input type="checkbox" checked={m.done} onChange={(e) => toggleMilestone(selected, m.id, e.target.checked)} />
                    <span>{m.title}</span>
                  </label>
                  <span className="muted small-text">{shortDate(m.due)}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={(p) => { setProjects((l) => [...l, p]); setShowNew(false); setSelectedId(p.id); }} />}
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: ProjectDto) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: '', vertical: VERTICALS[0], city: '', budget: '500', start: today, end: nextYear, description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      onCreated(await api<ProjectDto>('/api/projects', { method: 'POST', body: JSON.stringify({ ...form, budget: Number(form.budget) }) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>New project</h2>
        <div className="form-grid">
          <label className="span2">Name<input value={form.name} onChange={set('name')} required /></label>
          <label>Vertical<select value={form.vertical} onChange={set('vertical')}>{VERTICALS.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>City<input value={form.city} onChange={set('city')} required /></label>
          <label>Budget (₹ crore)<input type="number" min="1" value={form.budget} onChange={set('budget')} required /></label>
          <span />
          <label>Start<input type="date" value={form.start} onChange={set('start')} required /></label>
          <label>End<input type="date" value={form.end} onChange={set('end')} required /></label>
          <label className="span2">Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        </div>
        {error && <div className="alert-box" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Create project'}</button>
        </div>
      </form>
    </div>
  );
}
