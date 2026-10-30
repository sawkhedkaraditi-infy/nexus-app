'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/client';
import type { PropertyDto } from '@/lib/types';
import { lakh, num } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { ProjectArt } from '@/components/ProjectArt';

const CITIES = ['Metro City A', 'Metro City B', 'Port Cluster C', 'Tech Park F'];
const SLOTS = ['Weekday morning', 'Weekday evening', 'Saturday', 'Sunday'];

export default function RealtyPage() {
  const [items, setItems] = useState<PropertyDto[]>([]);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minBeds, setMinBeds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enquire, setEnquire] = useState<PropertyDto | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (city) p.set('city', city);
    if (type) p.set('type', type);
    if (maxPrice < 1000) p.set('maxPrice', String(maxPrice));
    if (minBeds) p.set('minBeds', String(minBeds));
    try {
      setItems(await api<PropertyDto[]>(`/api/realty?${p.toString()}`));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load properties');
    } finally {
      setLoading(false);
    }
  }, [city, type, maxPrice, minBeds]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFavorite(id: number) {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))); // optimistic
    try {
      await api(`/api/realty/${id}/favorite`, { method: 'POST' });
    } catch (e) {
      setItems((list) => list.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
      setError(e instanceof Error ? e.message : 'Could not update favourite');
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Realty Explorer <span className="tag">Add-on</span></h1>
          <p className="muted">Dummy listings. Save favourites and send a site-visit enquiry.</p>
        </div>
      </div>

      <div className="filters">
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option>Apartment</option><option>Villa</option><option>Office</option>
        </select>
        <select value={minBeds} onChange={(e) => setMinBeds(Number(e.target.value))}>
          <option value={0}>Any bedrooms</option>
          <option value={1}>1+ bedrooms</option><option value={2}>2+ bedrooms</option><option value={3}>3+ bedrooms</option><option value={4}>4+ bedrooms</option>
        </select>
        <label className="slider inline">
          <span>Max price <b>{maxPrice >= 1000 ? 'Any' : lakh(maxPrice)}</b></span>
          <input type="range" min={50} max={1000} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        </label>
      </div>

      {error && <div className="alert-box" role="alert">{error}</div>}
      {notice && <div className="notice-box" role="status">{notice}</div>}
      {loading && <div className="card muted">Loading…</div>}
      {!loading && items.length === 0 && <div className="card muted">No properties match these filters.</div>}

      <div className="proj-grid">
        {items.map((p) => (
          <article key={p.id} className="proj-card static">
            <div className="art-wrap">
              <ProjectArt kind="Realty" seed={p.id} className="proj-art" />
              <button className={`fav${p.favorite ? ' on' : ''}`} onClick={() => toggleFavorite(p.id)} aria-pressed={p.favorite} aria-label={p.favorite ? 'Remove from favourites' : 'Save to favourites'}>
                <Icon name="heart" />
              </button>
            </div>
            <div className="proj-body">
              <div className="proj-top">
                <span className="muted small-text">{p.type} · {p.city}</span>
                <span className={`badge ${p.status === 'Ready' ? 'st-completed' : 'st-planning'}`}>{p.status}</span>
              </div>
              <h3>{p.title}</h3>
              <div className="price">{lakh(p.price)}</div>
              <p className="muted small-text">{p.bedrooms ? `${p.bedrooms} bed · ` : ''}{num(p.areaSqft)} sq ft</p>
              <div className="chips">{p.amenities.map((a) => <span key={a} className="chip static">{a}</span>)}</div>
              <button className="btn ghost small" onClick={() => setEnquire(p)}>Book a site visit</button>
            </div>
          </article>
        ))}
      </div>

      {enquire && <EnquiryModal property={enquire} onClose={() => setEnquire(null)} onSent={(ref) => { setEnquire(null); setNotice(`Enquiry sent. Your reference is ${ref}.`); }} />}
    </div>
  );
}

function EnquiryModal({ property, onClose, onSent }: { property: PropertyDto; onClose: () => void; onSent: (ref: string) => void }) {
  const [slot, setSlot] = useState(SLOTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api<{ reference: string }>(`/api/realty/${property.id}/enquiry`, { method: 'POST', body: JSON.stringify({ slot, message }) });
      onSent(res.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send enquiry');
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Site visit: {property.title}</h2>
        <div className="form-grid">
          <label className="span2">Preferred slot<select value={slot} onChange={(e) => setSlot(e.target.value)}>{SLOTS.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="span2">Message<textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Anything we should know?" /></label>
        </div>
        {error && <div className="alert-box" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'}</button>
        </div>
      </form>
    </div>
  );
}
