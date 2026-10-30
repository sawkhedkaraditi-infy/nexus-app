// Shapes of the JSON returned by the API (dates arrive as ISO strings).
import type { Frame, LiveAlert } from './sim';

export type { Role, SessionUser } from './jwt';
export type { Frame, LiveAlert, PlantReading } from './sim';

export interface MilestoneDto {
  id: number;
  title: string;
  due: string;
  done: boolean;
}

export interface ProjectDto {
  id: number;
  name: string;
  vertical: string;
  city: string;
  manager: string;
  status: string;
  budget: number;
  spent: number;
  start: string;
  end: string;
  description: string;
  progress: number;
  milestones: MilestoneDto[];
}

export interface LoanProductDto {
  id: string;
  name: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  maxTenureMonths: number;
  blurb: string;
}

export interface LoanAppDto {
  id: number;
  ref: string;
  applicant: string;
  product: string;
  amount: number;
  tenureMonths: number;
  emi: number;
  purpose: string;
  createdAt: string;
  stage: number;
  status: string;
  score: number | null;
  reasons: string[];
}

export interface PropertyDto {
  id: number;
  title: string;
  city: string;
  type: string;
  bedrooms: number;
  areaSqft: number;
  price: number;
  status: string;
  amenities: string[];
  favorite: boolean;
}

export interface LiveDto {
  frames: Frame[];
  alerts: LiveAlert[];
  serverTime: number;
}

export interface AssistantAnswer {
  answer: string;
  sources: { doc: string; snippet: string; score: number }[];
}
