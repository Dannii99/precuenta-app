import { describe, it, expect } from 'vitest';
import { parseCop, formatCop, sumCop, multiplyCop } from './money';

describe('money', () => {
  describe('parseCop', () => {
    it('extracts digits from a formatted string', () => {
      expect(parseCop('12.900')).toBe(12900);
    });

    it('handles currency symbol and dots', () => {
      expect(parseCop('$ 1.299')).toBe(1299);
    });

    it('returns 0 for an empty string', () => {
      expect(parseCop('')).toBe(0);
    });

    it('handles a plain numeric string', () => {
      expect(parseCop('500')).toBe(500);
    });

    it('handles string with only non-digit characters', () => {
      expect(parseCop('abc')).toBe(0);
    });
  });

  describe('formatCop', () => {
    it('formats in es-CO locale with COP currency and no decimals', () => {
      const result = formatCop(12900);
      // es-CO format: $ 12.900 (dot as thousands separator, no decimals)
      expect(result).toBe('$ 12.900');
    });

    it('formats a small amount without thousands separator', () => {
      expect(formatCop(500)).toBe('$ 500');
    });

    it('formats zero', () => {
      expect(formatCop(0)).toBe('$ 0');
    });

    it('formats a large amount with thousands separators', () => {
      expect(formatCop(1_234_567)).toBe('$ 1.234.567');
    });
  });

  describe('sumCop', () => {
    it('sums two amounts (1299 + 2599 = 3898)', () => {
      expect(sumCop(1299, 2599)).toBe(3898);
    });

    it('sums multiple amounts', () => {
      expect(sumCop(1000, 2000, 3000)).toBe(6000);
    });

    it('returns 0 when no arguments are provided', () => {
      expect(sumCop()).toBe(0);
    });

    it('returns the same value for a single argument', () => {
      expect(sumCop(1299)).toBe(1299);
    });
  });

  describe('multiplyCop', () => {
    it('multiplyCop(1299, 3) = 3897', () => {
      expect(multiplyCop(1299, 3)).toBe(3897);
    });

    it('multiplyCop(2599, 3) = 7797', () => {
      expect(multiplyCop(2599, 3)).toBe(7797);
    });

    it('returns 0 when quantity is 0', () => {
      expect(multiplyCop(2599, 0)).toBe(0);
    });

    it('handles quantity of 1', () => {
      expect(multiplyCop(1299, 1)).toBe(1299);
    });

    it('truncates fractional quantities with Math.floor', () => {
      expect(multiplyCop(100, 2.7)).toBe(200);
    });
  });
});
