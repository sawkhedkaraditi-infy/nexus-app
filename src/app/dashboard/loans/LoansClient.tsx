'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/client';
import type { LoanAppDto, LoanProductDto } from '@/lib/types';
import { balanceCurve, calcEmi } from '@/lib/loan';
import { inr, shortDate } from '@/lib/format';
import { Donut, LineChart } from '@/components/Charts';

type Tab = 'calc' | 'apply' | 'mine';
const EMPLOYMENT = ['Salaried', 'Self-employed', 'Business owner'] as const;

export function LoansClient({ canSeeAll }: { canSeeAll: boolean }) {
  const [tab, setTab] = useState<Tab>('calc');
  const [products, setProducts] = useState<LoanProductDto[]>([]);
  const [productId, setProductId] = useState('home');
  const [amount, setAmount] = useState(2500000);
  const [months, setMonths] = useState(180);
  const [rate, setRate] = useState(8.6);
  const [error, setError] = useState('');

  useEffect(() => {
    api<LoanProductDto[]>('/api/loans/products').then(setProducts).catch((e: Error) => setError(e.message));
  }, []);

  const product = products.find((p) => p.id === productId);

  function pickProduct(id: string) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setRate(p.rate);
    setAmount((a) => Math.min(Math.max(a, p.minAmount), p.maxAmount));
    setMonths((m) => Math.min(m, p.maxTenureMonths));
  }

  const emi = useMemo(() => calcEmi(amount, rate, months), [amount, rate, months]);
  const total = emi * months;
  const interest = total - amount;
  const curve = useMemo(() => balanceCurve(amount, rate, months).map((v) => v / 100000), [amount, rate, months]);

  const step = product ? Math.max(10000, Math.round(product.maxAmount / 200 / 10000) * 10000) : 50000;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Loan Centre</h1>
          <p className="muted">Calculate an EMI, apply in three steps and track the decision. Everything here is a simulation.</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {([['calc', 'EMI calculator'], ['apply', 'Apply'], ['mine', canSeeAll ? 'Applications' : 'My applications']] as [Tab, string][]).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {error && <div className="alert-box" role="alert">{error}</div>}

      <div className="product-row">
        {products.map((p) => (
          <button key={p.id} className={`product${p.id === productId ? ' active' : ''}`} onClick={() => pickProduct(p.id)}>
            <strong>{p.name}</strong>
            <span>{p.rate}% p.a.</span>
            <small>{p.blurb}</small>
          </button>
        ))}
      </div>

      {tab === 'calc' && (
        <div className="grid-2">
          <section className="card">
            <h2 className="card-title">Your loan</h2>
            <label className="slider">
              <span>Loan amount <b>{inr(amount)}</b></span>
              <input type="range" min={product?.minAmount ?? 100000} max={product?.maxAmount ?? 10000000} step={step} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </label>
            <label className="slider">
              <span>Tenure <b>{months} months ({(months / 12).toFixed(1)} yrs)</b></span>
              <input type="range" min={12} max={product?.maxTenureMonths ?? 360} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
            </label>
            <label className="slider">
              <span>Interest rate <b>{rate.toFixed(2)}% p.a.</b></span>
              <input type="range" min={5} max={20} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </label>
          </section>

          <section className="card">
            <h2 className="card-title">Monthly EMI</h2>
            <div className="emi-big">{inr(emi)}</div>
            <div className="donut-row">
              <Donut
                parts={[{ label: 'Principal', value: amount, color: '#4fd4ff' }, { label: 'Interest', value: Math.max(0, interest), color: '#ffb23e' }]}
                center={<><b>{Math.round((interest / total) * 100)}%</b><small>interest</small></>}
              />
              <ul className="breakdown">
                <li><i style={{ background: '#4fd4ff' }} />Principal <b>{inr(amount)}</b></li>
                <li><i style={{ background: '#ffb23e' }} />Interest <b>{inr(interest)}</b></li>
                <li><i style={{ background: '#6ff0b0' }} />Total payable <b>{inr(total)}</b></li>
              </ul>
            </div>
          </section>

          <section className="card span-all">
            <h2 className="card-title">Outstanding balance by year (₹ lakh)</h2>
            <LineChart series={[{ name: 'Balance', color: '#4fd4ff', values: curve }]} area unit="L" />
          </section>
        </div>
      )}

      {tab === 'apply' && product && (
        <ApplyWizard
          product={product}
          amount={amount}
          months={months}
          emi={emi}
          onAmount={setAmount}
          onMonths={setMonths}
          onDone={() => setTab('mine')}
        />
      )}

      {tab === 'mine' && <Applications canSeeAll={canSeeAll} />}
    </div>
  );
}

function ApplyWizard({
  product, amount, months, emi, onAmount, onMonths, onDone,
}: {
  product: LoanProductDto; amount: number; months: number; emi: number;
  onAmount: (n: number) => void; onMonths: (n: number) => void; onDone: () => void;
}) {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState('90000');
  const [existing, setExisting] = useState('0');
  const [employment, setEmployment] = useState<(typeof EMPLOYMENT)[number]>('Salaried');
  const [credit, setCredit] = useState('740');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function next() {
    setError('');
    if (step === 1) {
      if (amount < product.minAmount || amount > product.maxAmount) return setError(`Amount must be between ${inr(product.minAmount)} and ${inr(product.maxAmount)}`);
      if (months > product.maxTenureMonths) return setError(`Maximum tenure is ${product.maxTenureMonths} months`);
    }
    if (step === 2) {
      if (!(Number(income) > 0)) return setError('Enter your monthly income');
      if (Number(credit) < 300 || Number(credit) > 900) return setError('Credit score must be between 300 and 900');
      if (purpose.trim().length < 3) return setError('Please describe the purpose of the loan');
    }
    setStep((s) => s + 1);
  }

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api('/api/loans/apply', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id, amount, tenureMonths: months,
          monthlyIncome: Number(income), existingEmi: Number(existing), employment,
          creditScore: Number(credit), purpose,
        }),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit');
      setBusy(false);
    }
  }

  return (
    <section className="card wizard">
      <ol className="wizard-steps">
        {['Loan details', 'About you', 'Review & submit'].map((label, i) => (
          <li key={label} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}><span>{i + 1}</span>{label}</li>
        ))}
      </ol>

      {step === 1 && (
        <div className="form-grid">
          <label>Loan product<input value={product.name} disabled /></label>
          <label>Interest rate<input value={`${product.rate}% p.a.`} disabled /></label>
          <label>Amount (₹)<input type="number" value={amount} onChange={(e) => onAmount(Number(e.target.value))} min={product.minAmount} max={product.maxAmount} /></label>
          <label>Tenure (months)<input type="number" value={months} onChange={(e) => onMonths(Number(e.target.value))} min={1} max={product.maxTenureMonths} /></label>
          <p className="muted span2">Estimated EMI: <b>{inr(emi)}</b> per month. Pick a different product using the cards above.</p>
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <label>Monthly income (₹)<input type="number" value={income} onChange={(e) => setIncome(e.target.value)} min={1} /></label>
          <label>Existing EMIs (₹ per month)<input type="number" value={existing} onChange={(e) => setExisting(e.target.value)} min={0} /></label>
          <label>Employment<select value={employment} onChange={(e) => setEmployment(e.target.value as (typeof EMPLOYMENT)[number])}>{EMPLOYMENT.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Credit score (300–900)<input type="number" value={credit} onChange={(e) => setCredit(e.target.value)} min={300} max={900} /></label>
          <label className="span2">Purpose<input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Buying an apartment" /></label>
          <p className="muted span2">Tip: try a low credit score or a high existing EMI to see a rejection with reasons.</p>
        </div>
      )}

      {step === 3 && (
        <dl className="review">
          <div><dt>Product</dt><dd>{product.name}</dd></div>
          <div><dt>Amount</dt><dd>{inr(amount)}</dd></div>
          <div><dt>Tenure</dt><dd>{months} months</dd></div>
          <div><dt>Estimated EMI</dt><dd>{inr(emi)}</dd></div>
          <div><dt>Monthly income</dt><dd>{inr(Number(income))}</dd></div>
          <div><dt>Existing EMIs</dt><dd>{inr(Number(existing))}</dd></div>
          <div><dt>Employment</dt><dd>{employment}</dd></div>
          <div><dt>Credit score</dt><dd>{credit}</dd></div>
          <div><dt>Purpose</dt><dd>{purpose}</dd></div>
        </dl>
      )}

      {error && <div className="alert-box" role="alert">{error}</div>}

      <div className="modal-actions">
        {step > 1 && <button className="btn ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>Back</button>}
        {step < 3 ? <button className="btn primary" onClick={next}>Continue</button> : <button className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>}
      </div>
    </section>
  );
}

function Applications({ canSeeAll }: { canSeeAll: boolean }) {
  const [apps, setApps] = useState<LoanAppDto[] | null>(null);
  const [all, setAll] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setApps(await api<LoanAppDto[]>(`/api/loans/mine${all ? '?scope=all' : ''}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load applications');
    }
  }, [all]);

  useEffect(() => {
    load();
  }, [load]);

  // keep polling while any application is still moving through its stages
  const pending = apps?.some((a) => a.stage < 2) ?? false;
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [pending, load]);

  return (
    <div className="stack">
      {canSeeAll && (
        <label className="check">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Show applications from all users
        </label>
      )}
      {error && <div className="alert-box" role="alert">{error}</div>}
      {apps === null && <div className="card muted">Loading…</div>}
      {apps?.length === 0 && <div className="card muted">No applications yet. Use the Apply tab to create one.</div>}
      {apps?.map((a) => (
        <section key={a.id} className="card loan">
          <div className="loan-top">
            <div>
              <span className="muted small-text">{a.ref} · {shortDate(a.createdAt)}{canSeeAll && all ? ` · ${a.applicant}` : ''}</span>
              <h3>{a.product} — {inr(a.amount)}</h3>
              <span className="muted">{a.tenureMonths} months · EMI {inr(a.emi)} · {a.purpose}</span>
            </div>
            <span className={`badge ln-${a.status.toLowerCase().replace(/\s+/g, '-')}`}>{a.status}</span>
          </div>
          <ol className="stepper">
            {['Submitted', 'Under Review', a.stage === 2 ? a.status : 'Decision'].map((label, i) => (
              <li key={i} className={i < a.stage ? 'done' : i === a.stage ? 'active' : ''}>
                <span>{i < a.stage || (i === 2 && a.stage === 2) ? '✓' : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          {a.stage === 2 && (
            <div className={`decision ${a.status === 'Approved' ? 'ok' : 'no'}`}>
              Eligibility score <b>{a.score}</b>/100.{' '}
              {a.status === 'Approved' ? 'Congratulations, this demo application is approved.' : `Not approved: ${a.reasons.join('; ')}.`}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
