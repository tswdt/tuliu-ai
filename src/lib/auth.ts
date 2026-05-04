import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    role: string;
    credits: number;
    avatarUrl: string | null;
    onboardingCompleted: boolean;
  };
  token?: string;
  error?: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(payload).toString('base64') + '.' + crypto.createHash('sha256').update(payload + JWT_SECRET).digest('hex').substring(0, 16);
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expectedSig = crypto.createHash('sha256').update(payload + JWT_SECRET).digest('hex').substring(0, 16);
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export async function registerWithEmail(email: string, password: string, name?: string): Promise<AuthResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: '该邮箱已注册' };
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name: name || email.split('@')[0],
        role: 'INDIVIDUAL',
        credits: 10,
        emailVerified: false,
      },
    });

    await prisma.quota.create({
      data: { userId: user.id, total: 10, used: 0, remaining: 10 },
    });

    logger.info('[用户系统] 注册成功', { email });
    return {
      success: true,
      user: formatUser(user),
      token: generateToken(user.id),
    };
  } catch (error) {
    logger.error('[用户系统] 注册失败', { error: (error as Error).message });
    return { success: false, error: '注册失败，请稍后重试' };
  }
}

export async function registerWithPhone(phone: string, password: string, name?: string): Promise<AuthResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return { success: false, error: '该手机号已注册' };
    }

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash: hashPassword(password),
        name: name || `用户${phone.slice(-4)}`,
        role: 'INDIVIDUAL',
        credits: 10,
        phoneVerified: false,
      },
    });

    await prisma.quota.create({
      data: { userId: user.id, total: 10, used: 0, remaining: 10 },
    });

    logger.info('[用户系统] 手机注册成功', { phone });
    return {
      success: true,
      user: formatUser(user),
      token: generateToken(user.id),
    };
  } catch (error) {
    logger.error('[用户系统] 手机注册失败', { error: (error as Error).message });
    return { success: false, error: '注册失败，请稍后重试' };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { success: false, error: '邮箱或密码错误' };
    }
    if (!user.isActive) {
      return { success: false, error: '账号已被禁用' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info('[用户系统] 邮箱登录成功', { email });
    return {
      success: true,
      user: formatUser(user),
      token: generateToken(user.id),
    };
  } catch (error) {
    logger.error('[用户系统] 登录失败', { error: (error as Error).message });
    return { success: false, error: '登录失败，请稍后重试' };
  }
}

export async function loginWithWechat(openId: string, unionId?: string): Promise<AuthResult> {
  try {
    let user = await prisma.user.findUnique({ where: { wechatOpenId: openId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wechatOpenId: openId,
          wechatUnionId: unionId,
          name: '微信用户',
          role: 'INDIVIDUAL',
          credits: 10,
        },
      });
      await prisma.quota.create({
        data: { userId: user.id, total: 10, used: 0, remaining: 10 },
      });
      logger.info('[用户系统] 微信新用户注册', { openId });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      success: true,
      user: formatUser(user),
      token: generateToken(user.id),
    };
  } catch (error) {
    logger.error('[用户系统] 微信登录失败', { error: (error as Error).message });
    return { success: false, error: '微信登录失败' };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    logger.info('[用户系统] 密码重置请求', { email });
    return { success: true, token: resetToken };
  } catch (error) {
    logger.error('[用户系统] 密码重置失败', { error: (error as Error).message });
    return { success: false, error: '操作失败' };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return { success: false, error: '重置链接已过期或无效' };
    }

    await prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: hashPassword(newPassword) },
    });

    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    logger.info('[用户系统] 密码重置成功', { userId: reset.userId });
    return { success: true };
  } catch (error) {
    logger.error('[用户系统] 密码重置失败', { error: (error as Error).message });
    return { success: false, error: '重置失败' };
  }
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    credits: user.credits,
    avatarUrl: user.avatarUrl,
    onboardingCompleted: user.onboardingCompleted,
  };
}
