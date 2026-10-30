// Pure functions: used by the API (to decide) and by the browser (to preview).

export function calcEmi(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

// Outstanding balance at the end of each year (index 0 = start).
export function balanceCurve(principal: number, annualRate: number, months: number): number[] {
  const r = annualRate / 12 / 100;
  const emi = calcEmi(principal, annualRate, months);
  let balance = principal;
  const out = [principal];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) - emi;
    if (m % 12 === 0 || m === months) out.push(Math.max(0, balance));
  }
  return out;
}

export interface EligibilityInput {
  creditScore: number;
  monthlyIncome: number;
  existingEmi: number;
  employment: string;
  emi: number;
}

// Simple, explainable eligibility score (0-100). Dummy rules for demonstration only.
export function evaluate(input: EligibilityInput) {
  const reasons: string[] = [];
  let score = 0;

  score += Math.max(0, Math.min(40, ((input.creditScore - 300) / 600) * 40));
  if (input.creditScore < 650) reasons.push('Credit score is below 650');

  const ratio = (input.existingEmi + input.emi) / input.monthlyIncome;
  const ratioScore = ratio <= 0.3 ? 40 : ratio <= 0.5 ? 40 - ((ratio - 0.3) / 0.2) * 25 : Math.max(0, 15 - (ratio - 0.5) * 60);
  score += ratioScore;
  if (ratio > 0.5) reasons.push(`EMI to income ratio is ${Math.round(ratio * 100)}% (limit is 50%)`);

  score += input.employment === 'Salaried' ? 20 : input.employment === 'Business owner' ? 16 : 13;

  const rounded = Math.round(score);
  const decision: 'Approved' | 'Rejected' = rounded >= 60 && ratio <= 0.5 ? 'Approved' : 'Rejected';
  if (decision === 'Approved') reasons.length = 0;
  if (decision === 'Rejected' && reasons.length === 0) reasons.push('Overall eligibility score is below the 60 point cut-off');
  return { score: rounded, decision, reasons, ratio };
}
