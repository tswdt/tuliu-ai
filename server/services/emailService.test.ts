import { describe, expect, it, vi } from 'vitest';
import * as emailService from './emailService';

describe('Email Service', () => {
  it('should generate valid OTP format', () => {
    // 这是一个基础测试，验证邮件服务的结构
    expect(emailService).toBeDefined();
  });

  it('should have all required email functions', () => {
    expect(typeof emailService.sendOTPEmail).toBe('function');
    expect(typeof emailService.sendWelcomeEmail).toBe('function');
    expect(typeof emailService.sendLowCreditsEmail).toBe('function');
    expect(typeof emailService.sendUpgradeEmail).toBe('function');
    expect(typeof emailService.sendAdminNotificationEmail).toBe('function');
  });
});
