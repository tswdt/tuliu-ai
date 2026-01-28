import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { translatePromptToEnglish, generateImage, getCreditsForSize, getTierName } from '../services/aiService';
import { addWatermark, isValidImageSize } from '../services/watermarkService';
import { sendLowCreditsEmail } from '../services/emailService';
import { generatedImages, users, transactions, type InsertGeneratedImage } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';

/**
 * 图片生成路由
 */
export const generateRouter = router({
  /**
   * 生成图片
   */
  generate: protectedProcedure
    .input(
      z.object({
        promptCn: z.string().min(1, '请输入中文 Prompt'),
        width: z.number().int().min(512).max(4096),
        height: z.number().int().min(512).max(4096),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '数据库连接失败',
        });
      }

      try {
        // 验证尺寸
        if (!isValidImageSize(input.width, input.height)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '无效的图片尺寸',
          });
        }

        const tier = getTierName(input.width, input.height) as 'trial' | 'standard' | 'hd' | 'ultra';
        const creditsNeeded = getCreditsForSize(input.width, input.height);

        // 检查积分
        const user = ctx.user;
        if (user.credits < creditsNeeded) {
          // 发送积分不足邮件
          await sendLowCreditsEmail(user.email, user.credits);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `积分不足，需要 ${creditsNeeded} 积分，当前余额 ${user.credits} 积分`,
          });
        }

        // 创建生成记录（初始状态为 pending）
        const insertData: InsertGeneratedImage = {
          userId: user.id,
          promptCn: input.promptCn,
          width: input.width,
          height: input.height,
          tier,
          creditsUsed: creditsNeeded,
          status: 'pending',
        };

        const result = await db
          .insert(generatedImages)
          .values(insertData);

        const imageId = (result as any)[0];

        try {
          // 翻译 Prompt
          const promptEn = await translatePromptToEnglish(input.promptCn);

          // 生成图片
          const imageUrl = await generateImage(promptEn, input.width, input.height);

          // 添加水印
          const watermarkedUrl = await addWatermark(imageUrl, tier, user.id);

          // 使用事务更新积分和生成记录
          await db.transaction(async (tx) => {
            // 扣费
            const newCredits = user.credits - creditsNeeded;
            await tx
              .update(users)
              .set({ credits: newCredits })
              .where(eq(users.id, user.id));

            // 记录交易
            await tx.insert(transactions).values({
              userId: user.id,
              type: 'generate',
              creditsDelta: -creditsNeeded,
              creditsAfter: newCredits,
              description: `生成 ${input.width}x${input.height} 图片`,
            });

            // 更新生成记录
            await tx
              .update(generatedImages)
              .set({
                promptEn,
                imageUrl,
                watermarkedUrl,
                status: 'success',
              })
              .where(eq(generatedImages.id, imageId));
          });

          return {
            success: true,
            imageId,
            imageUrl: watermarkedUrl,
            promptEn,
            creditsUsed: creditsNeeded,
            creditsRemaining: user.credits - creditsNeeded,
          };
        } catch (error) {
          // 更新生成记录为失败
          await db
            .update(generatedImages)
            .set({ status: 'failed' })
            .where(eq(generatedImages.id, imageId));

          throw error;
        }
      } catch (error) {
        console.error('[Generate] Failed:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '图片生成失败，请稍后重试',
        });
      }
    }),

  /**
   * 获取用户的生成历史
   */
  history: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '数据库连接失败',
        });
      }

      try {
        const images = await db
          .select()
          .from(generatedImages)
          .where(eq(generatedImages.userId, ctx.user.id))
          .limit(input?.limit || 50);

        return images;
      } catch (error) {
        console.error('[Generate] Get history failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取历史记录失败',
        });
      }
    }),
});
