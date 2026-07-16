import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

const publicPaths = ['/', '/api/POST/getlogin'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
