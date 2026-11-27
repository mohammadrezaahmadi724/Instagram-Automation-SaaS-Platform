import { NextResponse, type NextRequest } from 'next/server';

function safeCallback(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/app';
  return value;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('directora_session')?.value;
  const { pathname } = request.nextUrl;
  if ((pathname.startsWith('/app') || pathname.startsWith('/admin')) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callback', safeCallback(pathname));
    return NextResponse.redirect(url);
  }
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/app', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/app', '/app/:path*', '/admin', '/admin/:path*', '/login'] };
