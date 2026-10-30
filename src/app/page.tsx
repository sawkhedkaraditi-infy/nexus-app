import { getSession } from '@/lib/session';
import { Landing } from '@/components/Landing';

export default async function Home() {
  const user = await getSession();
  return <Landing signedIn={!!user} />;
}
