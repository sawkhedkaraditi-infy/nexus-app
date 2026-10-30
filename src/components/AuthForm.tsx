'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/client';

const DEMOS = [
  { label: 'Admin', email: 'admin@nexus.demo', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@nexus.demo', password: 'Manager@123' },
  { label: 'Customer', email: 'customer@nexus.demo', password: 'Customer@123' },
];

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
      });
      router.push(next && next.startsWith('/dashboard') ? next : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="muted">{mode === 'login' ? 'Sign in to open the Nexus dashboard.' : 'New accounts get the Customer role.'}</p>

      {mode === 'register' && (
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
      )}
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
      </label>

      {error && <div className="alert-box" role="alert">{error}</div>}

      <button className="btn primary" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>

      {mode === 'login' && (
        <div className="demo-box">
          <span className="muted">Demo accounts (dummy data):</span>
          <div className="demo-row">
            {DEMOS.map((d) => (
              <button type="button" key={d.label} className="chip" onClick={() => { setEmail(d.email); setPassword(d.password); }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="muted switch">
        {mode === 'login' ? (
          <>New here? <Link href="/register">Create an account</Link></>
        ) : (
          <>Already registered? <Link href="/login">Sign in</Link></>
        )}
      </p>
    </form>
  );
}
