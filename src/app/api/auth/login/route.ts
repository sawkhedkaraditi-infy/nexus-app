import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { startSession } from '@/lib/session';
import { fail } from '@/lib/guard';
import type { Role } from '@/lib/jwt';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Same message for unknown email and wrong password, so attackers cannot probe which emails exist.
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return fail('Incorrect email or password', 401);
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role as Role };
  await startSession(session);
  return NextResponse.json({ user: session });
}
