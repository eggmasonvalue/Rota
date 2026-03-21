import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { INITIAL_PLAYER_STATS, PlayerStats } from '../lib/scoring';

describe('usePlayerStats Hook', () => {
  const STATS_STORAGE_KEY = 'rota_player_stats';

  beforeEach(() => {
    localStorage.clear();
    // Mock system time for consistent testing of daily streaks
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default stats when localStorage is empty', () => {
    const { result } = renderHook(() => usePlayerStats());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.stats).toEqual(INITIAL_PLAYER_STATS);
  });

  it('loads valid stats from localStorage', () => {
    const customStats: PlayerStats = {
      ...INITIAL_PLAYER_STATS,
      elo: 1500,
      dailyStreak: 5,
      lastWinDate: '2026-03-21',
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(customStats));

    const { result } = renderHook(() => usePlayerStats());

    expect(result.current.stats.elo).toBe(1500);
    expect(result.current.stats.dailyStreak).toBe(5);
  });

  it('resets daily streak if a day was missed', () => {
    const customStats: PlayerStats = {
      ...INITIAL_PLAYER_STATS,
      elo: 1500,
      dailyStreak: 5,
      lastWinDate: '2026-03-19', // Missed the 20th
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(customStats));

    const { result } = renderHook(() => usePlayerStats());

    // Streak should be reset to 0 upon load
    expect(result.current.stats.dailyStreak).toBe(0);
  });

  it('maintains daily streak if played yesterday', () => {
    const customStats: PlayerStats = {
      ...INITIAL_PLAYER_STATS,
      elo: 1500,
      dailyStreak: 5,
      lastWinDate: '2026-03-20', // Yesterday
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(customStats));

    const { result } = renderHook(() => usePlayerStats());

    // Streak should still be 5
    expect(result.current.stats.dailyStreak).toBe(5);
  });

  it('records a game result correctly (Win)', () => {
    const { result } = renderHook(() => usePlayerStats());

    act(() => {
      // Player 1 (user) beats Merchant (1000 Elo)
      result.current.recordGameResult('MERCHANT', 'PLAYER1');
    });

    // Starting Elo 1000 vs Merchant 1000 -> Expected 0.5. Actual 1.
    // New Elo: 1000 + 32 * (1 - 0.5) = 1016
    expect(result.current.stats.elo).toBe(1016);
    expect(result.current.stats.statsByDifficulty.MERCHANT.wins).toBe(1);
    expect(result.current.stats.statsByDifficulty.MERCHANT.currentStreak).toBe(1);
    expect(result.current.stats.dailyStreak).toBe(1);
    expect(result.current.stats.lastWinDate).toBe('2026-03-21');
  });

  it('records a game result correctly (Loss)', () => {
    const { result } = renderHook(() => usePlayerStats());

    act(() => {
      // Player 1 loses to Merchant
      result.current.recordGameResult('MERCHANT', 'PLAYER2');
    });

    // Starting Elo 1000 vs Merchant 1000 -> Expected 0.5. Actual 0.
    // New Elo: 1000 + 32 * (0 - 0.5) = 984
    expect(result.current.stats.elo).toBe(984);
    expect(result.current.stats.statsByDifficulty.MERCHANT.losses).toBe(1);
    expect(result.current.stats.statsByDifficulty.MERCHANT.currentStreak).toBe(-1);
    expect(result.current.stats.dailyStreak).toBe(0); // Did not win
  });

  it('records a game result correctly (Draw)', () => {
    const { result } = renderHook(() => usePlayerStats());

    act(() => {
      // Player 1 draws with Merchant
      result.current.recordGameResult('MERCHANT', 'DRAW');
    });

    // Starting Elo 1000 vs Merchant 1000 -> Expected 0.5. Actual 0.5.
    // New Elo: 1000
    expect(result.current.stats.elo).toBe(1000);
    expect(result.current.stats.statsByDifficulty.MERCHANT.draws).toBe(1);
    expect(result.current.stats.statsByDifficulty.MERCHANT.currentStreak).toBe(0);
    expect(result.current.stats.dailyStreak).toBe(0); // Did not win
  });

  it('increments daily streak only once per day', () => {
    const { result } = renderHook(() => usePlayerStats());

    act(() => {
      result.current.recordGameResult('PLEBEIAN', 'PLAYER1');
    });
    expect(result.current.stats.dailyStreak).toBe(1);

    act(() => {
      result.current.recordGameResult('PLEBEIAN', 'PLAYER1');
    });
    // Still 1 because it's the same day
    expect(result.current.stats.dailyStreak).toBe(1);
  });

  it('resets stats to initial state', () => {
    const { result } = renderHook(() => usePlayerStats());

    act(() => {
      result.current.recordGameResult('PLEBEIAN', 'PLAYER1');
    });
    expect(result.current.stats.elo).toBeGreaterThan(1000);

    act(() => {
      result.current.resetStats();
    });

    expect(result.current.stats).toEqual(INITIAL_PLAYER_STATS);

    // Verify localStorage is cleared
    const stored = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY) || '{}');
    expect(stored.elo).toBe(1000);
  });
});