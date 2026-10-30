import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SideNav } from '@/components/SideNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');

  return (
    <div className="shell">
      <SideNav user={user} />
      <main className="main">{children}</main>
    </div>
  );
}
