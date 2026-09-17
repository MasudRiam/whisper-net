import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  const isAuthPage =
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/verify');

  const isProtectedPage = url.pathname.startsWith('/dashboard');

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && isProtectedPage) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/dashboard/:path*',
    '/verify/:path*',
  ],
};
