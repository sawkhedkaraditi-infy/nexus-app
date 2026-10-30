import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus | Concept platform for infrastructure, energy, realty and finance',
  description: 'A concept full-stack project with project tracking, live plant operations, a loan centre and more. All data is dummy data.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
