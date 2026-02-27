import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { getJson } from '@/lib/services/cos';
import { checkRateLimit, authRateLimit } from '@/lib/utils/rate-limit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hash = Buffer.from(bits).toString('hex');
  return hash === storedHash;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`auth:login:${ip}`, authRateLimit);
  if (!rl.allowed) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // Look up userId via email index
    const emailHash = Buffer.from(email.toLowerCase()).toString('base64url');
    const { data: index } = await getJson<{ userId: string }>(`indexes/email/${emailHash}.json`);
    if (!index) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    // Read profile
    const { data: profile } = await getJson<{ userId: string; email: string; passwordHash: string; salt: string }>(
      `users/${index.userId}/profile.json`
    );
    if (!profile) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const valid = await verifyPassword(password, profile.salt, profile.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const token = await new SignJWT({ email: profile.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(profile.userId)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    const res = NextResponse.json({ userId: profile.userId, email: profile.email });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败，请重试' }, { status: 500 });
  }
}
