import { getSession } from '@/lib/session';
import { LoansClient } from './LoansClient';

export default async function LoansPage() {
  const user = (await getSession())!;
  return <LoansClient canSeeAll={user.role !== 'customer'} />;
}
