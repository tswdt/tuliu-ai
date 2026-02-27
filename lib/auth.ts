import { jwtVerify } from 'jose';

export interface AuthUser {
  userId: string;
  email?: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
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
