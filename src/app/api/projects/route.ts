import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';
import { presentProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await guard(['manager', 'admin']);
  if (g.error) return g.error;
  const projects = await db.project.findMany({ include: { milestones: true }, orderBy: { id: 'asc' } });
  return NextResponse.json(projects.map(presentProject));
}

const createSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80),
  vertical: z.enum(['Infrastructure', 'Energy', 'Utilities & Metals', 'Realty', 'Technology']),
  city: z.string().trim().min(2).max(60),
  budget: z.number().positive('Budget must be positive').max(100000),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date is required'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date is required'),
  description: z.string().max(300).default(''),
});

export async function POST(req: Request) {
  const g = await guard(['manager', 'admin']);
  if (g.error) return g.error;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;
  if (d.end <= d.start) return fail('End date must be after start date');

  const project = await db.project.create({
    data: {
      name: d.name,
      vertical: d.vertical,
      city: d.city,
      manager: g.user.name,
      status: 'Planning',
      budget: d.budget,
      spent: 0,
      start: new Date(d.start),
      end: new Date(d.end),
      description: d.description,
      milestones: {
        create: [
          { title: 'Kick-off', due: new Date(d.start) },
          { title: 'Mid-point review', due: new Date((new Date(d.start).getTime() + new Date(d.end).getTime()) / 2) },
          { title: 'Handover', due: new Date(d.end) },
        ],
      },
    },
    include: { milestones: true },
  });
  return NextResponse.json(presentProject(project), { status: 201 });
}
