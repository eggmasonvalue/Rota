import { describe, it, expect } from 'vitest';
import {
  checkWin,
  checkRepetition,
  isBlocked,
  getNextPlayer,
  GameState,
  INITIAL_STATE
} from './game-logic';

describe('Game Logic', () => {
  describe('checkWin', () => {
    it('should detect a winning line on the edge', () => {
      // 0-1-2 is a winning line
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      board[1] = 'PLAYER1';
      board[2] = 'PLAYER1';
      expect(checkWin(board)).toBe('PLAYER1');
    });

    it('should detect a winning line through the center', () => {
      // 0-8-4 is a winning line (diameter)
      const board = Array(9).fill(null);
      board[0] = 'PLAYER2';
      board[8] = 'PLAYER2';
      board[4] = 'PLAYER2';
      expect(checkWin(board)).toBe('PLAYER2');
    });

    it('should return null if no winner', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      board[1] = 'PLAYER2';
      board[2] = 'PLAYER1';
      expect(checkWin(board)).toBeNull();
    });
  });

  describe('checkRepetition', () => {
    it('should detect threefold repetition', () => {
      const board = Array(9).fill(null);
      const player = 'PLAYER1';
      const stateStr = JSON.stringify({ board, player });

      const history = [stateStr, stateStr]; // Occurred twice before

      expect(checkRepetition(history, board, player)).toBe(true);
    });

    it('should not detect repetition if only twice total', () => {
      const board = Array(9).fill(null);
      const player = 'PLAYER1';
      const stateStr = JSON.stringify({ board, player });

      const history = [stateStr]; // Occurred once before

      expect(checkRepetition(history, board, player)).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('should return true if no moves available', () => {
      // Construct a blocked state for PLAYER1
      // PLAYER1 at 8 (center), surrounded by PLAYER2 at 0..7
      // But pieces count is limited to 3 each. So this scenario is impossible in standard game.
      // Let's create a realistic blocked scenario with 3 pieces each.
      // P1 at 8, P2 at 0, 1, 2 blocking P1? No, 8 connects to all.
      // P1 needs to be surrounded by P2 or empty spaces that aren't valid? No, empty spaces are valid.
      // P1 is blocked if all adjacent nodes are occupied.

      // Let's try: P1 at 0. Adjacent: 1, 7, 8.
      // If 1, 7, 8 are occupied by any piece (P1 or P2), P1 can't move to them?
      // No, P1 can't move to a spot occupied by ANY piece.

      const board = Array(9).fill(null);
      board[0] = 'PLAYER1'; // P1 piece
      board[1] = 'PLAYER2'; // Blocking
      board[7] = 'PLAYER2'; // Blocking
      board[8] = 'PLAYER1'; // Blocking (own piece)

      // But P1 has 3 pieces. Where is the 3rd?
      board[2] = 'PLAYER1';
      // P1 pieces at 0, 8, 2.
      // P2 pieces at 1, 7. + one more somewhere.
      board[3] = 'PLAYER2';

      // Let's check moves for P1.
      // From 0: neighbors 1, 7, 8. All occupied. Blocked.
      // From 8: neighbors 0..7.
      // 0 occupied (P1). 1 occupied (P2). 2 occupied (P1). 3 occupied (P2). 7 occupied (P2).
      // 4, 5, 6 are empty. So 8 can move to 4, 5, 6.
      // So P1 is NOT blocked globally.

      // We need a state where ALL P1 pieces are blocked.
      // P1 at 0. Neighbors 1, 7, 8.
      // P1 at 2. Neighbors 1, 3, 8.
      // P1 at 4. Neighbors 3, 5, 8.

      // P2 at 1, 3, 5?
      // P2 at 8?

      // Let's try:
      // P1: 0, 2, 4
      // P2: 1, 3, 8
      // Empty: 5, 6, 7

      // P1 moves:
      // 0 -> 1(P2), 7(Empty), 8(P2). Valid: 7.
      // So not blocked.

      // It's hard to block completely in Rota with 3 pieces each.
      // But let's force a scenario even if illegal pieces count, just to test logic.
      // The function doesn't check piece count.

      const blockedBoard = Array(9).fill('PLAYER2');
      blockedBoard[0] = 'PLAYER1'; // P1 has one piece, surrounded by P2
      // 1, 7, 8 are P2.

      const state: GameState = {
        ...INITIAL_STATE,
        board: blockedBoard,
        currentPlayer: 'PLAYER1',
        phase: 'MOVEMENT'
      };

      expect(isBlocked(state)).toBe(true);
    });

    it('should return false if moves available', () => {
       const board = Array(9).fill(null);
       board[0] = 'PLAYER1';
       const state: GameState = {
         ...INITIAL_STATE,
         board: board,
         currentPlayer: 'PLAYER1',
         phase: 'MOVEMENT'
       };
       expect(isBlocked(state)).toBe(false);
    });
  });

  describe('getNextPlayer', () => {
    it('should toggle player', () => {
      expect(getNextPlayer('PLAYER1')).toBe('PLAYER2');
      expect(getNextPlayer('PLAYER2')).toBe('PLAYER1');
    });
  });
});
