'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';
import type { SessionUser } from '@/lib/jwt';

const ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'grid', roles: ['customer', 'manager', 'admin'] },
  { href: '/dashboard/tracker', label: 'Project Tracker', icon: 'tracker', roles: ['manager', 'admin'] },
  { href: '/dashboard/live', label: 'Live Operations', icon: 'live', roles: ['manager', 'admin'] },
  { href: '/dashboard/loans', label: 'Loan Centre', icon: 'loans', roles: ['customer', 'manager', 'admin'] },
  { href: '/dashboard/realty', label: 'Realty', icon: 'realty', roles: ['customer', 'manager', 'admin'], tag: 'Add-on' },
  { href: '/dashboard/assistant', label: 'Assistant', icon: 'assistant', roles: ['customer', 'manager', 'admin'], tag: 'Add-on' },
];

export function SideNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="side">
      <Link href="/" className="brand">
        <span className="brand-mark">N</span>
        <span>Nexus</span>
      </Link>

      <nav className="side-nav">
        {ITEMS.filter((i) => i.roles.includes(user.role)).map((i) => {
          const active = i.href === '/dashboard' ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`side-link${active ? ' active' : ''}`}>
              <Icon name={i.icon} />
              <span>{i.label}</span>
              {i.tag && <em>{i.tag}</em>}
            </Link>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="who">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div>
            <strong>{user.name}</strong>
            <span className={`role role-${user.role}`}>{user.role}</span>
          </div>
        </div>
        <button className="btn ghost small" onClick={logout}>
          <Icon name="logout" size={16} /> Sign out
        </button>
        <p className="concept-note">Concept project with dummy data.</p>
      </div>
    </aside>
  );
}
