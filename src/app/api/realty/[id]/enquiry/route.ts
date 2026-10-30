import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';

const schema = z.object({
  message: z.string().trim().min(3, 'Please write a short message').max(300),
  slot: z.string().trim().min(3, 'Choose a time slot').max(40),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g.error) return g.error;

  const propertyId = Number((await ctx.params).id);
  if (!Number.isInteger(propertyId)) return fail('Invalid id');
  if (!(await db.property.findUnique({ where: { id: propertyId } }))) return fail('Property not found', 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const enquiry = await db.enquiry.create({ data: { userId: g.user.id, propertyId, ...parsed.data } });
  return NextResponse.json({ ok: true, reference: `ENQ-${100 + enquiry.id}` }, { status: 201 });
}
