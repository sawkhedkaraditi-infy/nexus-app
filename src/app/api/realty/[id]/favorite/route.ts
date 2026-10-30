import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g.error) return g.error;

  const propertyId = Number((await ctx.params).id);
  if (!Number.isInteger(propertyId)) return fail('Invalid id');
  if (!(await db.property.findUnique({ where: { id: propertyId } }))) return fail('Property not found', 404);

  const key = { userId_propertyId: { userId: g.user.id, propertyId } };
  const existing = await db.favorite.findUnique({ where: key });
  if (existing) {
    await db.favorite.delete({ where: key });
    return NextResponse.json({ favorite: false });
  }
  await db.favorite.create({ data: { userId: g.user.id, propertyId } });
  return NextResponse.json({ favorite: true });
}
