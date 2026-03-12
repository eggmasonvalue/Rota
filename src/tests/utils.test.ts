import { describe, it, expect, vi, afterEach } from 'vitest';
import { cn, generateUUID } from '../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge basic class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional class names', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('should merge and resolve tailwind class conflicts', () => {
      // p-4 and p-2 are conflicting, tailwind-merge should pick the last one
      expect(cn('p-4 text-red-500', 'p-2')).toBe('text-red-500 p-2');
    });

    it('should handle array inputs', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should handle object inputs', () => {
      expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
    });

    it('should handle undefined and null inputs', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
  });

  describe('generateUUID', () => {
    // Store original crypto
    const originalCrypto = globalThis.crypto;

    afterEach(() => {
      // Restore original crypto after each test
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true
      });
      vi.restoreAllMocks();
    });

    it('should generate a string in valid UUID v4 format', () => {
      const uuid = generateUUID();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidV4Regex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it('should use crypto.randomUUID when available', () => {
      const mockRandomUUID = vi.fn().mockReturnValue('mocked-uuid');
      Object.defineProperty(globalThis, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        writable: true,
        configurable: true
      });

      const uuid = generateUUID();
      expect(mockRandomUUID).toHaveBeenCalled();
      expect(uuid).toBe('mocked-uuid');
    });

    it('should fallback to crypto.getRandomValues when randomUUID is not available', () => {
      const mockGetRandomValues = vi.fn().mockImplementation((arr) => {
        arr[0] = 42; // arbitrary random value
        return arr;
      });

      Object.defineProperty(globalThis, 'crypto', {
        value: { getRandomValues: mockGetRandomValues },
        writable: true,
        configurable: true
      });

      const uuid = generateUUID();
      expect(mockGetRandomValues).toHaveBeenCalled();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidV4Regex);
    });

    it('should fallback to Math.random when no crypto is available', () => {
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const mockMathRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const uuid = generateUUID();

      expect(mockMathRandom).toHaveBeenCalled();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidV4Regex);

      mockMathRandom.mockRestore();
    });
  });
});
