import { describe, it, expect } from 'vitest';
import { calculateNewElo, getRankForElo, getScoreMultiplier } from '../lib/scoring';

describe('Scoring Logic', () => {
  describe('calculateNewElo', () => {
    it('increases elo significantly when a lower-rated player beats a higher-rated opponent', () => {
      const currentElo = 1000;
      const opponentRating = 1600; // Consul
      const actualScore = 1; // Win
      const newElo = calculateNewElo(currentElo, opponentRating, actualScore);

      expect(newElo).toBeGreaterThan(currentElo);
      // Expected score for 1000 vs 1600 is very low (~0.03), so actual (1) - expected is ~0.97.
      // 0.97 * 32 (K) is ~31.
      expect(newElo).toBeCloseTo(1031, -1);
    });

    it('decreases elo slightly when a lower-rated player loses to a higher-rated opponent', () => {
      const currentElo = 1000;
      const opponentRating = 1600; // Consul
      const actualScore = 0; // Loss
      const newElo = calculateNewElo(currentElo, opponentRating, actualScore);

      expect(newElo).toBeLessThan(currentElo);
      // Expected score ~0.03. Actual (0) - Expected is ~ -0.03.
      // -0.03 * 32 is ~ -1.
      expect(newElo).toBeCloseTo(999, -1);
    });

    it('handles a draw correctly (gain for lower player, loss for higher player)', () => {
      // 1000 drawing a 1600 should gain points
      const p1Elo = calculateNewElo(1000, 1600, 0.5);
      expect(p1Elo).toBeGreaterThan(1000);

      // 1600 drawing a 1000 should lose points
      const p2Elo = calculateNewElo(1600, 1000, 0.5);
      expect(p2Elo).toBeLessThan(1600);
    });

    it('prevents elo from dropping below 0', () => {
      const newElo = calculateNewElo(10, 1600, 0); // Loss
      expect(newElo).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRankForElo', () => {
    it('returns Plebeian for elo < 1000', () => {
      expect(getRankForElo(800).name).toBe('Plebeian');
      expect(getRankForElo(999).name).toBe('Plebeian');
      expect(getRankForElo(0).name).toBe('Plebeian');
    });

    it('returns Merchant for 1000 <= elo < 1200', () => {
      expect(getRankForElo(1000).name).toBe('Merchant');
      expect(getRankForElo(1199).name).toBe('Merchant');
    });

    it('returns Consul for elo >= 1600', () => {
      expect(getRankForElo(1600).name).toBe('Consul');
      expect(getRankForElo(2000).name).toBe('Consul');
    });
  });

  describe('getScoreMultiplier', () => {
    it('returns 1 if the player wins', () => {
      expect(getScoreMultiplier('PLAYER1', 'PLAYER1')).toBe(1);
      expect(getScoreMultiplier('PLAYER2', 'PLAYER2')).toBe(1);
    });

    it('returns 0 if the player loses', () => {
      expect(getScoreMultiplier('PLAYER2', 'PLAYER1')).toBe(0);
      expect(getScoreMultiplier('PLAYER1', 'PLAYER2')).toBe(0);
    });

    it('returns 0.5 if it is a draw', () => {
      expect(getScoreMultiplier('DRAW', 'PLAYER1')).toBe(0.5);
      expect(getScoreMultiplier('DRAW', 'PLAYER2')).toBe(0.5);
    });
  });
});