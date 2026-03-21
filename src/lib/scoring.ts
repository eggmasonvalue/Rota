import { Difficulty, Winner } from './game-logic';

export interface DifficultyStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
}

export interface PlayerStats {
  elo: number;
  dailyStreak: number;
  lastWinDate: string | null;
  statsByDifficulty: Record<Difficulty, DifficultyStats>;
}

export const INITIAL_PLAYER_STATS: PlayerStats = {
  elo: 1000,
  dailyStreak: 0,
  lastWinDate: null,
  statsByDifficulty: {
    PLEBEIAN: { wins: 0, losses: 0, draws: 0, currentStreak: 0 },
    MERCHANT: { wins: 0, losses: 0, draws: 0, currentStreak: 0 },
    EQUES: { wins: 0, losses: 0, draws: 0, currentStreak: 0 },
    SENATOR: { wins: 0, losses: 0, draws: 0, currentStreak: 0 },
    CONSUL: { wins: 0, losses: 0, draws: 0, currentStreak: 0 },
  },
};

export const AI_RATINGS: Record<Difficulty, number> = {
  PLEBEIAN: 800,
  MERCHANT: 1000,
  EQUES: 1200,
  SENATOR: 1400,
  CONSUL: 1600,
};

export const ELO_K_FACTOR = 32;

/**
 * Calculates the new Elo rating for the player.
 * @param currentElo The player's current Elo rating.
 * @param opponentRating The fixed rating of the AI opponent.
 * @param actualScore 1 for Win, 0.5 for Draw, 0 for Loss.
 * @returns The new Elo rating, rounded to the nearest integer.
 */
export function calculateNewElo(currentElo: number, opponentRating: number, actualScore: number): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentElo) / 400));
  const newElo = currentElo + ELO_K_FACTOR * (actualScore - expectedScore);
  // Prevent Elo from dropping below a sensible minimum (e.g., 0)
  return Math.max(0, Math.round(newElo));
}

export interface RankInfo {
  name: string;
  minElo: number;
  colorClass: string;
  glowClass: string;
}

export const RANKS: RankInfo[] = [
  { name: 'Plebeian', minElo: 0, colorClass: 'text-foreground/40', glowClass: '' },
  { name: 'Merchant', minElo: 1000, colorClass: 'text-foreground/80', glowClass: '' },
  { name: 'Eques', minElo: 1200, colorClass: 'text-orange-400', glowClass: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' }, // Bronze-ish
  { name: 'Senator', minElo: 1400, colorClass: 'text-secondary', glowClass: 'drop-shadow-[0_0_8px_var(--color-secondary)]' },
  { name: 'Consul', minElo: 1600, colorClass: 'text-primary', glowClass: 'drop-shadow-[0_0_8px_var(--color-primary)]' },
];

/**
 * Returns the RankInfo object for a given Elo rating.
 */
export function getRankForElo(elo: number): RankInfo {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (elo >= rank.minElo) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
}

/**
 * Helper to determine the actual score multiplier for the Elo formula.
 */
export function getScoreMultiplier(winner: Winner, playerRole: 'PLAYER1' | 'PLAYER2'): number {
  if (winner === 'DRAW') return 0.5;
  if (winner === playerRole) return 1;
  return 0; // Loss
}
