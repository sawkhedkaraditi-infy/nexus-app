import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';
import { calcEmi, evaluate } from '@/lib/loan';
import { presentLoan } from '@/lib/loanPresent';

const schema = z.object({
  productId: z.string(),
  amount: z.number().int().positive(),
  tenureMonths: z.number().int().positive(),
  monthlyIncome: z.number().int().positive('Monthly income must be greater than zero'),
  existingEmi: z.number().int().min(0),
  employment: z.enum(['Salaried', 'Self-employed', 'Business owner']),
  creditScore: z.number().int().min(300, 'Credit score must be between 300 and 900').max(900, 'Credit score must be between 300 and 900'),
  purpose: z.string().trim().min(3, 'Please describe the purpose').max(120),
});

export async function POST(req: Request) {
  const g = await guard();
  if (g.error) return g.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const product = await db.loanProduct.findUnique({ where: { id: d.productId } });
  if (!product) return fail('Unknown loan product');
  if (d.amount < product.minAmount || d.amount > product.maxAmount) {
    return fail(`Amount must be between ${product.minAmount} and ${product.maxAmount}`);
  }
  if (d.tenureMonths > product.maxTenureMonths) return fail(`Maximum tenure is ${product.maxTenureMonths} months`);

  const emi = calcEmi(d.amount, product.rate, d.tenureMonths);
  const result = evaluate({ creditScore: d.creditScore, monthlyIncome: d.monthlyIncome, existingEmi: d.existingEmi, employment: d.employment, emi });

  const created = await db.loanApplication.create({
    data: {
      userId: g.user.id,
      productId: product.id,
      amount: d.amount,
      tenureMonths: d.tenureMonths,
      monthlyIncome: d.monthlyIncome,
      existingEmi: d.existingEmi,
      employment: d.employment,
      creditScore: d.creditScore,
      purpose: d.purpose,
      emi,
      score: result.score,
      decision: result.decision,
      reasons: result.reasons,
    },
    include: { product: true, user: true },
  });
  return NextResponse.json(presentLoan(created), { status: 201 });
}
