import type { Prisma } from '@prisma/client';

export const STAGE_SECONDS = 12; // demo: each stage lasts 12s so tracking feels live

export type LoanWithRelations = Prisma.LoanApplicationGetPayload<{ include: { product: true; user: true } }>;

export function presentLoan(a: LoanWithRelations) {
  const elapsed = (Date.now() - a.createdAt.getTime()) / 1000;
  const stage = elapsed < STAGE_SECONDS ? 0 : elapsed < STAGE_SECONDS * 2 ? 1 : 2;
  const status = stage === 0 ? 'Submitted' : stage === 1 ? 'Under Review' : a.decision;
  return {
    id: a.id,
    ref: `LN-${1000 + a.id}`,
    applicant: a.user.name,
    product: a.product.name,
    amount: a.amount,
    tenureMonths: a.tenureMonths,
    emi: Math.round(a.emi),
    purpose: a.purpose,
    createdAt: a.createdAt.toISOString(),
    stage,
    status,
    score: stage === 2 ? a.score : null,
    reasons: stage === 2 ? ((a.reasons as unknown as string[]) ?? []) : [],
  };
}
