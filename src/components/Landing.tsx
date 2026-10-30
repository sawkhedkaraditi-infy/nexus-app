'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Skyline } from './Skyline';
import { ProjectArt } from './ProjectArt';
import { Reveal } from './Reveal';
import { Counter } from './Counter';
import { Icon } from './Icon';

const HEADLINE = 'Engineering the future, one connected project at a time.'.split(' ');

const VERTICALS = [
  { name: 'Infrastructure', kind: 'Infrastructure', text: 'Bridges, metro corridors and urban mobility planned, tracked and delivered at scale.' },
  { name: 'Utilities & Metals', kind: 'Utilities & Metals', text: 'Water networks and heavy industry where resource handling meets precision engineering.' },
  { name: 'Energy', kind: 'Energy', text: 'Solar, hydro and green hydrogen projects monitored from commissioning to output.' },
  { name: 'Realty', kind: 'Realty', text: 'Residences and workspaces designed for quality, with a smooth path from enquiry to site visit.' },
  { name: 'Technology', kind: 'Technology', text: 'Data centres and digital platforms that connect the physical and the digital.' },
  { name: 'Financial Services', kind: 'Finance', text: 'Accessible loans with transparent EMIs, clear eligibility and live application tracking.' },
];

const FEATURED = [
  { name: 'Harbour Link Sea Bridge', kind: 'Infrastructure', city: 'Metro City A' },
  { name: 'Solar Park Alpha', kind: 'Energy', city: 'Desert Zone 1' },
  { name: 'Skyline Residences Tower', kind: 'Realty', city: 'Metro City A' },
  { name: 'Hyperscale Data Centre Campus', kind: 'Technology', city: 'Tech Park F' },
  { name: 'Specialty Steel Mill Upgrade', kind: 'Utilities & Metals', city: 'Industrial Belt E' },
  { name: 'Home Loan Programme', kind: 'Finance', city: 'Nationwide' },
];

const MODULES = [
  { icon: 'tracker', title: 'Project Tracker', tag: 'Core', points: ['Milestones with live progress', 'Gantt-style timeline', 'Budget versus actual by vertical'] },
  { icon: 'live', title: 'Live Operations', tag: 'Core', points: ['Plant output refreshed every 2 seconds', 'Temperature and load charts', 'Automatic warning and critical alerts'] },
  { icon: 'loans', title: 'Loan Centre', tag: 'Core', points: ['Interactive EMI calculator', 'Three-step application wizard', 'Eligibility score and decision tracking'] },
  { icon: 'realty', title: 'Realty Explorer', tag: 'Add-on', points: ['Filter by city, type, price and size', 'Favourites saved per user', 'Site-visit enquiries'] },
  { icon: 'assistant', title: 'Smart Assistant', tag: 'Add-on', points: ['Answers from a sample knowledge base', 'Shows which document each answer came from', 'Ready to upgrade to embeddings and an LLM'] },
];

const STACK = ['Next.js', 'React', 'TypeScript', 'Prisma ORM', 'MySQL', 'JWT in httpOnly cookies', 'bcrypt', 'Zod validation', 'Role-based access', 'Framer Motion', 'REST API', 'Vercel'];

export function Landing({ signedIn }: { signedIn: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="landing">
      <header className="nav">
        <Link href="/" className="brand"><span className="brand-mark">N</span><span>Nexus</span></Link>
        <nav>
          <a href="#verticals">Verticals</a>
          <a href="#platform">Platform</a>
          <a href="#stack">Tech</a>
        </nav>
        {signedIn ? (
          <Link href="/dashboard" className="btn primary small">Open dashboard</Link>
        ) : (
          <div className="nav-cta">
            <Link href="/login" className="btn ghost small">Sign in</Link>
            <Link href="/register" className="btn primary small">Get started</Link>
          </div>
        )}
      </header>

      <section ref={heroRef} className="hero">
        <motion.div className="hero-art" style={{ y: artY }}>
          <Skyline />
        </motion.div>
        <motion.div className="hero-copy" style={{ y: copyY, opacity: fade }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Concept platform · dummy data
          </motion.span>
          <h1>
            {HEADLINE.map((word, i) => (
              <motion.span key={i} className="word" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: 'easeOut' }}>
                {word}{' '}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }}>
            Project tracking, live plant operations, financial services and customer experiences, brought together in one secure, role-based platform.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.1 }}>
            <Link href={signedIn ? '/dashboard' : '/register'} className="btn primary">{signedIn ? 'Open dashboard' : 'Create an account'}</Link>
            <a href="#platform" className="btn ghost">Explore the platform</a>
          </motion.div>
        </motion.div>
      </section>

      <section className="stats">
        {[
          { to: 6, label: 'Business verticals', suffix: '' },
          { to: 8, label: 'Sample projects tracked', suffix: '' },
          { to: 430, label: 'MW of simulated capacity', suffix: '' },
          { to: 21280, label: 'Crore of dummy budget', prefix: '₹' },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="stat">
            <strong><Counter to={s.to} prefix={s.prefix} suffix={s.suffix} /></strong>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </section>

      <section id="verticals" className="section">
        <Reveal><h2>Six verticals, one platform</h2><p className="lead">Each business area gets its own flavour of data and workflow, all behind one sign-in.</p></Reveal>
        <div className="vgrid">
          {VERTICALS.map((v, i) => (
            <Reveal key={v.name} delay={(i % 3) * 0.1}>
              <motion.article className="vcard" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <ProjectArt kind={v.kind} seed={i + 1} className="vcard-art" />
                <div className="vcard-body"><h3>{v.name}</h3><p>{v.text}</p></div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section tight">
        <Reveal><h2>Featured sample projects</h2><p className="lead">Illustrations are generated in code. Names, cities and figures are invented.</p></Reveal>
        <div className="marquee" aria-label="Featured sample projects">
          <div className="marquee-track">
            {[...FEATURED, ...FEATURED].map((f, i) => (
              <div className="mcard" key={i} aria-hidden={i >= FEATURED.length}>
                <ProjectArt kind={f.kind} seed={(i % FEATURED.length) + 1} className="mcard-art" />
                <div><strong>{f.name}</strong><span>{f.city}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="section">
        <Reveal><h2>What you can do inside</h2><p className="lead">Three core modules built in depth, plus two lighter add-ons.</p></Reveal>
        <div className="modules">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 0.1}>
              <div className={`module${m.tag === 'Add-on' ? ' addon' : ''}`}>
                <div className="module-head"><span className="module-icon"><Icon name={m.icon} size={22} /></span><span className="tag">{m.tag}</span></div>
                <h3>{m.title}</h3>
                <ul>{m.points.map((p) => <li key={p}><Icon name="check" size={14} />{p}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="stack" className="section tight">
        <Reveal><h2>Built with</h2><p className="lead">A full-stack TypeScript app: React front end, route-handler API, relational database.</p></Reveal>
        <Reveal><div className="stack-chips">{STACK.map((s) => <span key={s} className="chip static">{s}</span>)}</div></Reveal>
      </section>

      <section className="cta">
        <Reveal>
          <h2>See it working</h2>
          <p>Sign in with a demo account to explore each role: Admin, Manager or Customer.</p>
          <Link href={signedIn ? '/dashboard' : '/login'} className="btn primary">{signedIn ? 'Open dashboard' : 'Try the demo'}</Link>
        </Reveal>
      </section>

      <footer className="footer">
        <p>
          Nexus is an independent concept project built for learning and portfolio purposes. It is not affiliated with, endorsed by or connected to any company it was inspired by.
          All projects, people, places and figures shown are dummy data.
        </p>
      </footer>
    </div>
  );
}
