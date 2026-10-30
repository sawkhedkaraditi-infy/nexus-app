import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { startSession } from '@/lib/session';
import { fail } from '@/lib/guard';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return fail('An account with this email already exists', 409);

  // Self-registration always creates a customer. Elevated roles are assigned by an admin.
  const user = await db.user.create({
    data: { name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 10), role: 'customer' },
  });

  const session = { id: user.id, name: user.name, email: user.email, role: 'customer' as const };
  await startSession(session);
  return NextResponse.json({ user: session }, { status: 201 });
}
