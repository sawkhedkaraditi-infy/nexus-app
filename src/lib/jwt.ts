// Edge-safe helpers (used by both middleware and route handlers).
import { SignJWT, jwtVerify } from 'jose';

export type Role = 'customer' | 'manager' | 'admin';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export const COOKIE = 'nexus_session';

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is not set. Add it in your hosting environment variables.');
  }
  return new TextEncoder().encode(value || 'dev-only-secret-do-not-use-in-production');
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifySession(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
