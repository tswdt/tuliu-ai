import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/generate', '/dashboard', '/editor'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) return NextResponse.next();

  const tokenCookie = req.cookies.get('token')?.value;

  if (!tokenCookie) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(tokenCookie, getJwtSecret());
    return NextResponse.next();
  } catch {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/generate/:path*', '/dashboard/:path*', '/editor/:path*'],
};
