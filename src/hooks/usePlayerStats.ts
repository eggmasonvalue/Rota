import { useState, useEffect, useCallback } from 'react';
import { Difficulty, Winner } from '@/lib/game-logic';
import { PlayerStats, INITIAL_PLAYER_STATS, AI_RATINGS, calculateNewElo, getScoreMultiplier } from '@/lib/scoring';

const STATS_STORAGE_KEY = 'rota_player_stats';

function getTodayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function usePlayerStats() {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PlayerStats;
        // Verify structure
        if (parsed && typeof parsed.elo === 'number') {
          // Check daily streak reset logic
          const today = getTodayString();
          const updatedStats = { ...parsed };

          if (updatedStats.lastWinDate) {
              const lastWin = new Date(updatedStats.lastWinDate);
              const currentDate = new Date(today);
              // Set hours to 0 to compare just the date difference
              lastWin.setHours(0,0,0,0);
              currentDate.setHours(0,0,0,0);

              const diffTime = Math.abs(currentDate.getTime() - lastWin.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 1) {
                  // Missed a day
                  updatedStats.dailyStreak = 0;
              }
          }

          // Backfill statsByDifficulty in case user has old data structure
          if (!updatedStats.statsByDifficulty) {
             updatedStats.statsByDifficulty = INITIAL_PLAYER_STATS.statsByDifficulty;
          } else {
             // Ensure all difficulties exist
             for (const d of Object.keys(INITIAL_PLAYER_STATS.statsByDifficulty) as Difficulty[]) {
                if (!updatedStats.statsByDifficulty[d]) {
                    updatedStats.statsByDifficulty[d] = { wins: 0, losses: 0, draws: 0, currentStreak: 0 };
                }
             }
          }

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStats(updatedStats);
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats));
        } else {

          setStats(INITIAL_PLAYER_STATS);
        }
      } else {

        setStats(INITIAL_PLAYER_STATS);
      }
    } catch (e) {
      console.error("Failed to parse player stats", e);

      setStats(INITIAL_PLAYER_STATS);
    }
    setIsLoaded(true);
  }, []);

  const saveStats = useCallback((newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error("Failed to save player stats", e);
    }
  }, []);

  const recordGameResult = useCallback((difficulty: Difficulty, winner: Winner, playerRole: 'PLAYER1' | 'PLAYER2' = 'PLAYER1') => {
      setStats(prev => {
          const aiRating = AI_RATINGS[difficulty];
          const actualScore = getScoreMultiplier(winner, playerRole);
          const newElo = calculateNewElo(prev.elo, aiRating, actualScore);

          const newDiffStats = { ...prev.statsByDifficulty[difficulty] };

          if (winner === 'DRAW') {
              newDiffStats.draws += 1;
              newDiffStats.currentStreak = 0;
          } else if (winner === playerRole) {
              newDiffStats.wins += 1;
              newDiffStats.currentStreak = newDiffStats.currentStreak > 0 ? newDiffStats.currentStreak + 1 : 1;
          } else {
              newDiffStats.losses += 1;
              newDiffStats.currentStreak = newDiffStats.currentStreak < 0 ? newDiffStats.currentStreak - 1 : -1;
          }

          let newDailyStreak = prev.dailyStreak;
          let newLastWinDate = prev.lastWinDate;

          if (winner === playerRole) {
             const today = getTodayString();
             if (prev.lastWinDate !== today) {
                // Not won yet today.
                // If last win was yesterday, increment. Otherwise, start at 1.
                if (prev.lastWinDate) {
                    const lastWin = new Date(prev.lastWinDate);
                    const currentDate = new Date(today);
                    lastWin.setHours(0,0,0,0);
                    currentDate.setHours(0,0,0,0);
                    const diffTime = Math.abs(currentDate.getTime() - lastWin.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        newDailyStreak++;
                    } else if (diffDays > 1) {
                        newDailyStreak = 1;
                    }
                } else {
                    newDailyStreak = 1;
                }
                newLastWinDate = today;
             }
          }

          const newStats: PlayerStats = {
              elo: newElo,
              dailyStreak: newDailyStreak,
              lastWinDate: newLastWinDate,
              statsByDifficulty: {
                  ...prev.statsByDifficulty,
                  [difficulty]: newDiffStats
              }
          };

          try {
             localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
          } catch {
             // Silently catch serialization/storage errors
          }

          return newStats;
      });
  }, []);

  const resetStats = useCallback(() => {
    saveStats(INITIAL_PLAYER_STATS);
  }, [saveStats]);

  return {
    stats,
    isLoaded,
    recordGameResult,
    resetStats
  };
}