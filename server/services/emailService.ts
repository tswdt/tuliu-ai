import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: ENV.emailHost,
      port: ENV.emailPort,
      secure: ENV.emailPort === 465,
      auth: {
        user: ENV.emailUser,
        pass: ENV.emailPass,
      },
    });
  }
  return transporter;
}

/**
 * 发送 OTP 验证码邮件
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Tuliu AI" <${ENV.emailUser}>`,
      to: email,
      subject: 'Tuliu AI - 邮箱验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff006e, #b700ff); padding: 20px; border-radius: 8px; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tuliu AI</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">AI 电商图片生成平台</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333; margin-top: 0;">邮箱验证</h2>
            <p style="color: #666; font-size: 16px;">您的验证码是：</p>
            <div style="background: white; border: 2px solid #ff006e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #ff006e; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">此验证码有效期为 10 分钟，请勿分享给他人。</p>
            <p style="color: #999; font-size: 14px;">如果您没有请求此验证码，请忽略此邮件。</p>
          </div>
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send OTP:', error);
    return false;
  }
}

/**
 * 发送注册欢迎邮件
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Tuliu AI" <${ENV.emailUser}>`,
      to: email,
      subject: 'Tuliu AI - 欢迎加入！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00f5ff, #00c8ff); padding: 20px; border-radius: 8px; color: #000;">
            <h1 style="margin: 0; font-size: 28px;">Tuliu AI</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">AI 电商图片生成平台</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333; margin-top: 0;">欢迎 ${name || ''}！</h2>
            <p style="color: #666; font-size: 16px;">感谢您注册 Tuliu AI。您已获得 <strong>10 积分</strong> 用于生成图片。</p>
            <h3 style="color: #333;">积分说明：</h3>
            <ul style="color: #666;">
              <li>Trial (800x800): 0 积分（含水印）</li>
              <li>Standard (1024x1024): 1 积分</li>
              <li>HD (2048x2048): 2 积分</li>
              <li>Ultra (4096x4096): 4 积分</li>
            </ul>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <a href="https://tuliu.ai/dashboard" style="color: #ff006e; text-decoration: none; font-weight: bold;">立即前往 Dashboard</a> 开始生成图片吧！
            </p>
          </div>
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return false;
  }
}

/**
 * 发送积分不足提醒邮件
 */
export async function sendLowCreditsEmail(email: string, currentCredits: number): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Tuliu AI" <${ENV.emailUser}>`,
      to: email,
      subject: 'Tuliu AI - 积分不足提醒',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff006e, #b700ff); padding: 20px; border-radius: 8px; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tuliu AI</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">AI 电商图片生成平台</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333; margin-top: 0;">积分不足</h2>
            <p style="color: #666; font-size: 16px;">您的账户积分不足，当前余额：<strong>${currentCredits} 积分</strong></p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <a href="https://tuliu.ai/pricing" style="color: #ff006e; text-decoration: none; font-weight: bold;">升级套餐</a> 获得更多积分，继续享受 AI 生成服务。
            </p>
          </div>
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send low credits email:', error);
    return false;
  }
}

/**
 * 发送升级套餐确认邮件
 */
export async function sendUpgradeEmail(email: string, tier: string, creditsAdded: number): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Tuliu AI" <${ENV.emailUser}>`,
      to: email,
      subject: 'Tuliu AI - 套餐升级成功',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #39ff14, #00f5ff); padding: 20px; border-radius: 8px; color: #000;">
            <h1 style="margin: 0; font-size: 28px;">Tuliu AI</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">AI 电商图片生成平台</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333; margin-top: 0;">套餐升级成功！</h2>
            <p style="color: #666; font-size: 16px;">恭喜！您已成功升级到 <strong>${tier}</strong> 套餐。</p>
            <p style="color: #666; font-size: 14px;">新增积分：<strong style="color: #39ff14;">+${creditsAdded}</strong></p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <a href="https://tuliu.ai/dashboard" style="color: #ff006e; text-decoration: none; font-weight: bold;">返回 Dashboard</a> 继续生成图片。
            </p>
          </div>
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send upgrade email:', error);
    return false;
  }
}

/**
 * 发送管理员通知邮件
 */
export async function sendAdminNotificationEmail(subject: string, content: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Tuliu AI" <${ENV.emailUser}>`,
      to: ENV.emailUser,
      subject: `[Tuliu AI Admin] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff006e, #b700ff); padding: 20px; border-radius: 8px; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tuliu AI - 管理员通知</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <div style="color: #666; font-size: 14px; line-height: 1.6;">
              ${content}
            </div>
          </div>
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 Tuliu AI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send admin notification:', error);
    return false;
  }
}
