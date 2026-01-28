import { describe, expect, it } from 'vitest';
import { isValidImageSize } from './watermarkService';

describe('Watermark Service', () => {
  describe('isValidImageSize', () => {
    it('should return true for trial size (800x800)', () => {
      expect(isValidImageSize(800, 800)).toBe(true);
    });

    it('should return true for standard size (1024x1024)', () => {
      expect(isValidImageSize(1024, 1024)).toBe(true);
    });

    it('should return true for HD size (2048x2048)', () => {
      expect(isValidImageSize(2048, 2048)).toBe(true);
    });

    it('should return true for ultra size (4096x4096)', () => {
      expect(isValidImageSize(4096, 4096)).toBe(true);
    });

    it('should return false for invalid size', () => {
      expect(isValidImageSize(512, 512)).toBe(false);
      expect(isValidImageSize(1920, 1080)).toBe(false);
      expect(isValidImageSize(800, 1024)).toBe(false);
    });
  });
});
