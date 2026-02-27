import { jwtVerify } from 'jose';
import { env } from '@/lib/env';

export interface AuthUser {
  userId: string;
  email?: string;
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function getCurrentUser(cookieHeader: string | null): Promise<AuthUser | null> {
  if (!cookieHeader) return null;

  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (!tokenMatch) return null;

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(tokenMatch[1], secret);
    const userId = payload.sub ?? (payload.userId as string | undefined);
    if (!userId) return null;
    return { userId, email: payload.email as string | undefined };
  } catch {
    return null;
  }
}
