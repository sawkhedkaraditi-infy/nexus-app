import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';

export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  return NextResponse.json({ user: g.user });
}
