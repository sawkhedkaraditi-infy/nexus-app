import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guard } from '@/lib/guard';
import { presentLoan } from '@/lib/loanPresent';

export const dynamic = 'force-dynamic';

// Customers see their own applications. Managers and admins can add ?scope=all to see everyone's.
export async function GET(req: Request) {
  const g = await guard();
  if (g.error) return g.error;

  const wantsAll = new URL(req.url).searchParams.get('scope') === 'all';
  const canSeeAll = g.user.role === 'admin' || g.user.role === 'manager';

  const rows = await db.loanApplication.findMany({
    where: wantsAll && canSeeAll ? {} : { userId: g.user.id },
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(rows.map(presentLoan));
}
