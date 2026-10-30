import type { Prisma } from '@prisma/client';

export type ProjectWithMilestones = Prisma.ProjectGetPayload<{ include: { milestones: true } }>;

export const progressOf = (p: ProjectWithMilestones): number =>
  p.milestones.length ? Math.round((p.milestones.filter((m) => m.done).length / p.milestones.length) * 100) : 0;

export function presentProject(p: ProjectWithMilestones) {
  return {
    id: p.id,
    name: p.name,
    vertical: p.vertical,
    city: p.city,
    manager: p.manager,
    status: p.status,
    budget: p.budget,
    spent: p.spent,
    start: p.start.toISOString(),
    end: p.end.toISOString(),
    description: p.description,
    progress: progressOf(p),
    milestones: [...p.milestones]
      .sort((a, b) => a.due.getTime() - b.due.getTime() || a.id - b.id)
      .map((m) => ({ id: m.id, title: m.title, due: m.due.toISOString(), done: m.done })),
  };
}

// Status rules used by the tracker (and described in the dummy "Project Handbook").
export function nextStatus(p: ProjectWithMilestones): string {
  const progress = progressOf(p);
  if (progress === 100) return 'Completed';
  if (p.end.getTime() < Date.now()) return 'Delayed';
  const spentPct = (p.spent / p.budget) * 100;
  if (spentPct - progress > 25) return 'At Risk';
  if (p.status === 'Completed' || p.status === 'Delayed') return 'On Track';
  return p.status;
}
