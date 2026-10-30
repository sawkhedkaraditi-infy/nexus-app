import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { Skyline } from '@/components/Skyline';

export default function RegisterPage() {
  return (
    <div className="auth">
      <div className="auth-art">
        <Skyline />
        <div className="auth-art-text">
          <h2>Create a customer account.</h2>
          <p>You will be able to try the Loan Centre, Realty Explorer and Assistant.</p>
        </div>
      </div>
      <div className="auth-panel">
        <Link href="/" className="brand"><span className="brand-mark">N</span><span>Nexus</span></Link>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
