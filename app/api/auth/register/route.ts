import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { getJson, putJson } from '@/lib/services/cos';
import { addCredit } from '@/lib/services/wallet';
import { checkRateLimit, authRateLimit } from '@/lib/utils/rate-limit';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomUUID();
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hash = Buffer.from(bits).toString('hex');
  return { hash, salt };
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`auth:register:${ip}`, authRateLimit);
  if (!rl.allowed) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '参数无效', details: parsed.error.issues }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // Check duplicate email via index
    const emailHash = Buffer.from(email.toLowerCase()).toString('base64url');
    const { data: existing } = await getJson<{ userId: string }>(`indexes/email/${emailHash}.json`);
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
    }

    const userId = `user_${crypto.randomUUID()}`;
    const { hash: passwordHash, salt } = await hashPassword(password);

    // Store profile
    await putJson(`users/${userId}/profile.json`, {
      userId,
      email,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    });

    // Store email index
    await putJson(`indexes/email/${emailHash}.json`, { userId });

    // Initialize wallet with 3 welcome credits
    await putJson(`users/${userId}/wallet.json`, {
      balance: 3,
      transactions: [{ amount: 3, date: Date.now(), type: 'welcome_bonus' }],
    });

    // Sign JWT
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    const res = NextResponse.json({ userId, email }, { status: 201 });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
  }
}
