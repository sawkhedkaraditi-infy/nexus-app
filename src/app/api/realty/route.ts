import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guard } from '@/lib/guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const g = await guard();
  if (g.error) return g.error;

  const q = new URL(req.url).searchParams;
  const where: Prisma.PropertyWhereInput = {};
  if (q.get('city')) where.city = q.get('city')!;
  if (q.get('type')) where.type = q.get('type')!;
  if (q.get('maxPrice')) where.price = { lte: Number(q.get('maxPrice')) };
  if (q.get('minBeds')) where.bedrooms = { gte: Number(q.get('minBeds')) };

  const rows = await db.property.findMany({
    where,
    orderBy: { id: 'asc' },
    include: { favorites: { where: { userId: g.user.id } } },
  });

  return NextResponse.json(
    rows.map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      type: p.type,
      bedrooms: p.bedrooms,
      areaSqft: p.areaSqft,
      price: p.price,
      status: p.status,
      amenities: p.amenities.split(','),
      favorite: p.favorites.length > 0,
    })),
  );
}
