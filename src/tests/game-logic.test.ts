import { describe, it, expect } from 'vitest';
import {
  checkWin,
  checkRepetition,
  isBlocked,
  getNextPlayer,
  getPossibleMoves,
  isValidMovement,
  GameState,
  INITIAL_STATE
} from '../lib/game-logic';

describe('Game Logic', () => {
  describe('isValidMovement', () => {
    it('should return true for a valid move to an adjacent empty cell', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      // Based on ADJACENCY logic: 0 is adjacent to 1, 7, and 8 (center)
      expect(isValidMovement(board, 0, 1)).toBe(true);
      expect(isValidMovement(board, 0, 7)).toBe(true);
      expect(isValidMovement(board, 0, 8)).toBe(true);
    });

    it('should return false if the source cell is empty', () => {
      const board = Array(9).fill(null);
      // Empty cell 0 trying to move to an adjacent empty cell 1
      expect(isValidMovement(board, 0, 1)).toBe(false);
    });

    it('should return false if the target cell is occupied', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      board[1] = 'PLAYER2';
      // 0 is adjacent to 1, but 1 is occupied
      expect(isValidMovement(board, 0, 1)).toBe(false);
    });

    it('should return false if the target cell is not adjacent', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      // Based on ADJACENCY logic: 0 is NOT adjacent to 2
      expect(isValidMovement(board, 0, 2)).toBe(false);
    });
  });

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

  describe('getPossibleMoves', () => {
    it('should return all cells during PLACEMENT on empty board', () => {
      const state: GameState = { ...INITIAL_STATE, phase: 'PLACEMENT' };
      const moves = getPossibleMoves(state);
      expect(moves).toHaveLength(9);
      moves.forEach(m => expect(m.from).toBeNull());
    });

    it('should return only empty cells during PLACEMENT', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      board[4] = 'PLAYER2';
      const state: GameState = { ...INITIAL_STATE, board, phase: 'PLACEMENT' };
      const moves = getPossibleMoves(state);
      expect(moves).toHaveLength(7);
      expect(moves.find(m => m.to === 0)).toBeUndefined();
      expect(moves.find(m => m.to === 4)).toBeUndefined();
    });

    it('should return valid adjacent moves during MOVEMENT', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1'; // Adj: 1, 7, 8
      const state: GameState = {
        ...INITIAL_STATE,
        board,
        currentPlayer: 'PLAYER1',
        phase: 'MOVEMENT'
      };
      const moves = getPossibleMoves(state);
      expect(moves).toHaveLength(3);
      expect(moves).toContainEqual({ from: 0, to: 1 });
      expect(moves).toContainEqual({ from: 0, to: 7 });
      expect(moves).toContainEqual({ from: 0, to: 8 });
    });

    it('should only return moves for the current player', () => {
      const board = Array(9).fill(null);
      board[0] = 'PLAYER1';
      board[1] = 'PLAYER2';
      const state: GameState = {
        ...INITIAL_STATE,
        board,
        currentPlayer: 'PLAYER2',
        phase: 'MOVEMENT'
      };
      const moves = getPossibleMoves(state);
      // P2 at 1. Adj: 0, 2, 8. 0 is occupied by P1.
      // So moves from 1 to 2 and 8.
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({ from: 1, to: 2 });
      expect(moves).toContainEqual({ from: 1, to: 8 });
      expect(moves.every(m => m.from === 1)).toBe(true);
    });

    it('should return empty array if player is blocked', () => {
      const board = Array(9).fill('PLAYER2');
      board[0] = 'PLAYER1';
      const state: GameState = {
        ...INITIAL_STATE,
        board,
        currentPlayer: 'PLAYER1',
        phase: 'MOVEMENT'
      };
      const moves = getPossibleMoves(state);
      expect(moves).toHaveLength(0);
    });

    it('should return empty array during GAME_OVER', () => {
      const state: GameState = { ...INITIAL_STATE, phase: 'GAME_OVER' };
      const moves = getPossibleMoves(state);
      expect(moves).toHaveLength(0);
    });
  });
});
