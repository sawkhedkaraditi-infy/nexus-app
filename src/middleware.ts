import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, verifySession } from '@/lib/jwt';

// Runs before every matched request. Keeps signed-out visitors out of /dashboard and
// keeps customers out of manager-only pages. API routes check roles again on their own.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await verifySession(req.cookies.get(COOKIE)?.value);

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    const managerOnly = pathname.startsWith('/dashboard/tracker') || pathname.startsWith('/dashboard/live');
    if (managerOnly && user.role === 'customer') {
      return NextResponse.redirect(new URL('/dashboard/loans', req.url));
    }
  }

  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
