import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { Skyline } from '@/components/Skyline';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="auth">
      <div className="auth-art">
        <Skyline />
        <div className="auth-art-text">
          <h2>One platform for projects, plants and people.</h2>
          <p>Concept project. Every project, person and figure is dummy data.</p>
        </div>
      </div>
      <div className="auth-panel">
        <Link href="/" className="brand"><span className="brand-mark">N</span><span>Nexus</span></Link>
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
