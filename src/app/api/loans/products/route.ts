import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guard } from '@/lib/guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  return NextResponse.json(await db.loanProduct.findMany({ orderBy: { rate: 'asc' } }));
}
