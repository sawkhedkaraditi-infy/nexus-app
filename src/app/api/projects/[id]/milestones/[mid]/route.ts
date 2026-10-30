import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';
import { nextStatus, presentProject } from '@/lib/projects';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; mid: string }> }) {
  const g = await guard(['manager', 'admin']);
  if (g.error) return g.error;

  const { id, mid } = await ctx.params;
  const projectId = Number(id);
  const milestoneId = Number(mid);
  if (!Number.isInteger(projectId) || !Number.isInteger(milestoneId)) return fail('Invalid id');

  const milestone = await db.milestone.findFirst({ where: { id: milestoneId, projectId } });
  if (!milestone) return fail('Milestone not found', 404);

  const body = (await req.json().catch(() => ({}))) as { done?: unknown };
  await db.milestone.update({
    where: { id: milestone.id },
    data: { done: typeof body.done === 'boolean' ? body.done : !milestone.done },
  });

  const project = await db.project.findUnique({ where: { id: projectId }, include: { milestones: true } });
  if (!project) return fail('Project not found', 404);

  const status = nextStatus(project);
  const saved = status !== project.status
    ? await db.project.update({ where: { id: projectId }, data: { status }, include: { milestones: true } })
    : project;
  return NextResponse.json(presentProject(saved));
}
