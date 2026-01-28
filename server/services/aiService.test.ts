import { describe, expect, it } from 'vitest';
import { getCreditsForSize, getTierName } from './aiService';

describe('AI Service', () => {
  describe('getCreditsForSize', () => {
    it('should return 0 credits for trial size (800x800)', () => {
      expect(getCreditsForSize(800, 800)).toBe(0);
    });

    it('should return 1 credit for standard size (1024x1024)', () => {
      expect(getCreditsForSize(1024, 1024)).toBe(1);
    });

    it('should return 2 credits for HD size (2048x2048)', () => {
      expect(getCreditsForSize(2048, 2048)).toBe(2);
    });

    it('should return 4 credits for ultra size (4096x4096)', () => {
      expect(getCreditsForSize(4096, 4096)).toBe(4);
    });

    it('should return default 1 credit for unknown size', () => {
      expect(getCreditsForSize(512, 512)).toBe(1);
    });
  });

  describe('getTierName', () => {
    it('should return trial for 800x800', () => {
      expect(getTierName(800, 800)).toBe('trial');
    });

    it('should return standard for 1024x1024', () => {
      expect(getTierName(1024, 1024)).toBe('standard');
    });

    it('should return hd for 2048x2048', () => {
      expect(getTierName(2048, 2048)).toBe('hd');
    });

    it('should return ultra for 4096x4096', () => {
      expect(getTierName(4096, 4096)).toBe('ultra');
    });

    it('should return standard for unknown size', () => {
      expect(getTierName(512, 512)).toBe('standard');
    });
  });
});
