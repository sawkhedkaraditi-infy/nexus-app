import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { Icon } from '@/components/Icon';
import { ProjectArt } from '@/components/ProjectArt';
import { Reveal } from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export default async function Overview() {
  const user = (await getSession())!;
  const isStaff = user.role !== 'customer';

  const projects = isStaff ? await db.project.findMany({ include: { milestones: true } }) : [];
  const [myLoans, favorites, plants] = await Promise.all([
    db.loanApplication.count({ where: { userId: user.id } }),
    db.favorite.count({ where: { userId: user.id } }),
    db.plant.count(),
  ]);

  const avg = projects.length
    ? Math.round(
        projects.reduce((s, p) => s + (p.milestones.length ? (p.milestones.filter((m) => m.done).length / p.milestones.length) * 100 : 0), 0) / projects.length,
      )
    : 0;
  const atRisk = projects.filter((p) => p.status === 'At Risk' || p.status === 'Delayed').length;

  const tiles = [
    { href: '/dashboard/tracker', title: 'Project Tracker', text: 'Milestones, timelines and budget vs actual across every vertical.', icon: 'tracker', kind: 'Infrastructure', staff: true },
    { href: '/dashboard/live', title: 'Live Operations', text: 'Streaming plant output, temperature and alerts (simulated).', icon: 'live', kind: 'Energy', staff: true },
    { href: '/dashboard/loans', title: 'Loan Centre', text: 'EMI calculator, step-by-step application and status tracking.', icon: 'loans', kind: 'Finance', staff: false },
    { href: '/dashboard/realty', title: 'Realty Explorer', text: 'Browse properties, save favourites and book a site visit.', icon: 'realty', kind: 'Realty', staff: false },
    { href: '/dashboard/assistant', title: 'Smart Assistant', text: 'Ask questions answered from the sample knowledge base.', icon: 'assistant', kind: 'Technology', staff: false },
  ].filter((t) => isStaff || !t.staff);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p className="muted">
            You are signed in as <span className={`role role-${user.role}`}>{user.role}</span>. {isStaff ? 'You can see every module.' : 'Customers see the Loan Centre, Realty and Assistant.'}
          </p>
        </div>
      </div>

      <div className="kpis">
        {isStaff ? (
          <>
            <div className="kpi"><span className="kpi-label">Projects tracked</span><span className="kpi-value">{projects.length}</span></div>
            <div className="kpi"><span className="kpi-label">Average progress</span><span className="kpi-value">{avg}%</span></div>
            <div className="kpi"><span className="kpi-label">At risk or delayed</span><span className="kpi-value warn">{atRisk}</span></div>
            <div className="kpi"><span className="kpi-label">Plants monitored</span><span className="kpi-value">{plants}</span></div>
          </>
        ) : (
          <>
            <div className="kpi"><span className="kpi-label">My loan applications</span><span className="kpi-value">{myLoans}</span></div>
            <div className="kpi"><span className="kpi-label">Saved properties</span><span className="kpi-value">{favorites}</span></div>
          </>
        )}
      </div>

      <div className="tiles">
        {tiles.map((t, i) => (
          <Reveal key={t.href} delay={i * 0.06}>
            <Link href={t.href} className="tile">
              <ProjectArt kind={t.kind} seed={i + 1} className="tile-art" />
              <div className="tile-body">
                <h3><Icon name={t.icon} /> {t.title}</h3>
                <p className="muted">{t.text}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
