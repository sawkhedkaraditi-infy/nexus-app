import { NextResponse } from 'next/server';
import { getSession } from './session';
import type { Role, SessionUser } from './jwt';

type GuardResult = { user: SessionUser; error?: undefined } | { error: NextResponse; user?: undefined };

// Call at the top of every protected route handler:
//   const g = await guard(['manager', 'admin']);
//   if (g.error) return g.error;
export async function guard(roles?: Role[]): Promise<GuardResult> {
  const user = await getSession();
  if (!user) return { error: NextResponse.json({ error: 'Please sign in' }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: 'Your role does not have access to this resource' }, { status: 403 }) };
  }
  return { user };
}

export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
