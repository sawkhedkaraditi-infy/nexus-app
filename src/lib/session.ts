import { cookies } from 'next/headers';
import { COOKIE, SessionUser, signSession, verifySession } from './jwt';

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export async function startSession(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true, // not readable from JavaScript, which blocks token theft via XSS
    sameSite: 'lax', // blocks cross-site POSTs (CSRF)
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
