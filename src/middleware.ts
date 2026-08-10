import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, isValidSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isValidSession(cookie)) return NextResponse.next();

  const login = new URL('/login', request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/') login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  // Todo queda detrás del password menos el propio login y los estáticos que
  // el navegador necesita antes de autenticarse (manifest, iconos, SW).
  matcher: [
    '/((?!login|_next/static|_next/image|favicon.ico|icon-|manifest.webmanifest|sw.js|apple-touch-icon).*)',
  ],
};
