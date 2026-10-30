import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guard } from '@/lib/guard';
import { deriveAlerts, history } from '@/lib/sim';

export const dynamic = 'force-dynamic';

// The browser polls this every 2 seconds. Plant definitions come from the database;
// the readings are simulated from the current time (see lib/sim.ts).
export async function GET() {
  const g = await guard(['manager', 'admin']);
  if (g.error) return g.error;

  const plants = await db.plant.findMany({ orderBy: { id: 'asc' } });
  const now = Date.now();
  const frames = history(plants, now, 300); // 10 minutes of readings, used to derive alerts
  return NextResponse.json({ frames: frames.slice(-40), alerts: deriveAlerts(frames), serverTime: now });
}
