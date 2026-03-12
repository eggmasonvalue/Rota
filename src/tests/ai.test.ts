import { describe, it, expect } from 'vitest';
import { getBestMove } from '../lib/ai';
import { GameState, INITIAL_STATE, Difficulty } from '../lib/game-logic';

describe('AI Logic', () => {
  const difficulties: Difficulty[] = ['PLEBEIAN', 'MERCHANT', 'EQUES', 'SENATOR', 'CONSUL'];

  it('should return a valid move for all difficulties in initial state', () => {
    const state = { ...INITIAL_STATE };

    difficulties.forEach(difficulty => {
      const move = getBestMove(state, difficulty);
      expect(move).not.toBeNull();
      expect(move?.from).toBeNull(); // Placement phase
      expect(move?.to).toBeGreaterThanOrEqual(0);
      expect(move?.to).toBeLessThan(9);
    });
  });

  it('should prioritize winning immediately (CONSUL)', () => {
    // Setup a board where AI (PLAYER2) can win
    // P2 at 0, 1. Empty at 2.
    const board = Array(9).fill(null);
    board[0] = 'PLAYER2';
    board[1] = 'PLAYER2';
    board[3] = 'PLAYER1'; // Distraction
    board[4] = 'PLAYER1';

    const state: GameState = {
      ...INITIAL_STATE,
      board,
      currentPlayer: 'PLAYER2',
      phase: 'PLACEMENT', // Or movement, doesn't matter much for eval, but let's say placement to fill spot
      piecesCount: { PLAYER1: 2, PLAYER2: 2 }
    };

    const move = getBestMove(state, 'CONSUL');
    // 0 and 1 are occupied.
    // 2 completes 0-1-2.
    // 7 completes 7-0-1.
    // Both are winning moves.
    expect([2, 7]).toContain(move?.to);
  });

  it('should block opponent win (CONSUL)', () => {
    // Setup a board where P1 is about to win
    // P1 at 0, 1. Threat is at 2 (completes 0-1-2).
    // P2 at 7 blocks the other end (7-0-1).
    // P2 at 5 prevents P1 from creating a fork through center (1-8-5).
    const board = Array(9).fill(null);
    board[0] = 'PLAYER1';
    board[1] = 'PLAYER1';
    board[7] = 'PLAYER2';
    board[4] = 'PLAYER2';

    const state: GameState = {
      ...INITIAL_STATE,
      board,
      currentPlayer: 'PLAYER2',
      phase: 'PLACEMENT',
      piecesCount: { PLAYER1: 2, PLAYER2: 2 }
    };

    const move = getBestMove(state, 'CONSUL');
    expect(move?.to).toBe(2); // Should block 0-1-2
  });
  it('should optimize evaluation to score threats properly', () => {
    // Setup a board that requires counting
    // Let's create an exact scenario with 2 player pieces + 1 empty
    // And another with 2 opponent pieces + 1 empty
    const board = Array(9).fill(null);
    // P1 pieces (current player)
    board[0] = 'PLAYER1';
    board[1] = 'PLAYER1';
    // Threat for P1 is at 2 or 7 (completes 0-1-2 or 7-0-1)

    // P2 pieces
    board[3] = 'PLAYER2';
    board[4] = 'PLAYER2';
    // Threat for P2 is at 2 or 5 (completes 2-3-4 or 3-4-5)

    const state: GameState = {
      ...INITIAL_STATE,
      board,
      currentPlayer: 'PLAYER1',
      phase: 'PLACEMENT',
      piecesCount: { PLAYER1: 2, PLAYER2: 2 }
    };

    // P1 to move. P1 can win by moving to 2 or 7.
    // Moving to 2 also blocks P2's 2-3-4 threat.
    const move = getBestMove(state, 'CONSUL');
    expect([2, 7]).toContain(move?.to); // Should find winning move
  });
});
