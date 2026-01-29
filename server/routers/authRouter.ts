import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb, createOTPRecord, getValidOTPRecord, deleteOTPRecord, getUserByEmail, upsertUser } from '../db';
import { sendOTPEmail, sendWelcomeEmail, sendAdminNotificationEmail } from '../services/emailService';
import { COOKIE_NAME } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';
import { sdk } from '../_core/sdk';

/**
 * 生成 6 位随机数字 OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 邮箱验证码认证路由
 */
export const authRouter = router({
  /**
   * 发送 OTP 到邮箱
   */
  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟后过期

        // 保存 OTP 到数据库
        await createOTPRecord({
          email: input.email,
          otp,
          expiresAt,
        });

        // 发送邮件
        // 在开发环境下，始终将验证码打印到控制台，方便调试
        console.log(`[DEV] OTP for ${input.email}: ${otp}`);
        const sent = await sendOTPEmail(input.email, otp);
        if (!sent && process.env.NODE_ENV === 'production') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '邮件发送失败，请稍后重试',
          });
        }

        return { success: true, message: '验证码已发送到您的邮箱' };
      } catch (error) {
        console.error('[Auth] Send OTP failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '发送验证码失败',
        });
      }
    }),

  /**
   * 验证 OTP 并完成登录/注册
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().length(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // 验证 OTP
        const otpRecord = await getValidOTPRecord(input.email, input.otp);
        if (!otpRecord) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '验证码无效或已过期',
          });
        }

        // 删除已使用的 OTP
        await deleteOTPRecord(otpRecord.id);

        // 检查用户是否存在
        const existingUser = await getUserByEmail(input.email);
        const isNewUser = !existingUser;

        // 创建或更新用户
        const openId = `email-${input.email}`;
        await upsertUser({
          openId,
          email: input.email,
          loginMethod: 'email-otp',
          lastSignedIn: new Date(),
        });

        // 如果是新用户，发送欢迎邮件和管理员通知
        if (isNewUser) {
          await sendWelcomeEmail(input.email);
          await sendAdminNotificationEmail(
            '新用户注册',
            `<p>新用户已注册：<strong>${input.email}</strong></p>`
          );
        }

        // 设置登录 Cookie
        const token = await sdk.createSessionToken(openId, { name: input.email.split('@')[0] });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        // 返回登录成功信息
        return {
          success: true,
          isNewUser,
          message: isNewUser ? '注册成功！' : '登录成功！',
        };
      } catch (error) {
        console.error('[Auth] Verify OTP failed:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '验证失败，请稍后重试',
        });
      }
    }),

  /**
   * 获取当前用户信息
   */
  me: publicProcedure.query(({ ctx }) => {
    // @ts-ignore
    return ctx.user || null;
  }),

  /**
   * 登出
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});
