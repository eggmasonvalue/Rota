import { describe, it, expect } from 'vitest';
import { gameReducer } from '../app/page';
import { GameState, INITIAL_STATE, Action } from '../lib/game-logic';

describe('gameReducer', () => {
  it('should return the initial state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as Action;
    const newState = gameReducer(INITIAL_STATE, action);
    expect(newState).toEqual(INITIAL_STATE);
  });

  describe('PLACE_PIECE action', () => {
    it('should ignore PLACE_PIECE when not in PLACEMENT phase', () => {
      const state: GameState = { ...INITIAL_STATE, phase: 'MOVEMENT' };
      const action: Action = { type: 'PLACE_PIECE', index: 0 };
      const newState = gameReducer(state, action);
      expect(newState).toEqual(state);
    });

    it('should place a piece and switch player', () => {
      const action: Action = { type: 'PLACE_PIECE', index: 0 };
      const newState = gameReducer(INITIAL_STATE, action);

      expect(newState.board[0]).toBe('PLAYER1');
      expect(newState.piecesCount.PLAYER1).toBe(1);
      expect(newState.currentPlayer).toBe('PLAYER2');
      expect(newState.history.length).toBe(1);
    });

    it('should transition to MOVEMENT phase when both players place 3 pieces', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        // Make sure placing 3 pieces does not form a winning line
        // (0-1-6 is not a line, 3-4-8 is not a line)
        board: ['PLAYER1', 'PLAYER1', null, 'PLAYER2', 'PLAYER2', null, null, null, null],
        piecesCount: { PLAYER1: 2, PLAYER2: 2 },
        currentPlayer: 'PLAYER1',
        history: ['state1', 'state2', 'state3', 'state4']
      };

      // Player 1 places 3rd piece at index 6 (not winning, not blocking)
      let newState = gameReducer(state, { type: 'PLACE_PIECE', index: 6 });
      expect(newState.phase).toBe('PLACEMENT');
      expect(newState.piecesCount.PLAYER1).toBe(3);
      expect(newState.currentPlayer).toBe('PLAYER2');

      // Player 2 places 3rd piece at index 8
      newState = gameReducer(newState, { type: 'PLACE_PIECE', index: 8 });
      expect(newState.phase).toBe('MOVEMENT');
      expect(newState.piecesCount.PLAYER2).toBe(3);
      expect(newState.currentPlayer).toBe('PLAYER1');
    });

    it('should ignore invalid placement', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        board: ['PLAYER1', null, null, null, null, null, null, null, null],
        piecesCount: { PLAYER1: 1, PLAYER2: 0 },
        currentPlayer: 'PLAYER2'
      };

      const action: Action = { type: 'PLACE_PIECE', index: 0 }; // Cell 0 is already occupied
      const newState = gameReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('should detect win on placement', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        board: ['PLAYER1', 'PLAYER1', null, 'PLAYER2', 'PLAYER2', null, null, null, null],
        piecesCount: { PLAYER1: 2, PLAYER2: 2 },
        currentPlayer: 'PLAYER1',
        history: ['state1', 'state2', 'state3', 'state4']
      };

      // Player 1 places 3rd piece at 2, completing the line 0-1-2
      const newState = gameReducer(state, { type: 'PLACE_PIECE', index: 2 });

      expect(newState.phase).toBe('GAME_OVER');
      expect(newState.winner).toBe('PLAYER1');
    });
  });

  describe('SELECT_PIECE action', () => {
    it('should ignore SELECT_PIECE when not in MOVEMENT phase', () => {
      const state: GameState = { ...INITIAL_STATE, phase: 'PLACEMENT' };
      const action: Action = { type: 'SELECT_PIECE', index: 0 };
      const newState = gameReducer(state, action);
      expect(newState).toEqual(state);
    });

    it('should select a piece of the current player', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', null, null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER1'
      };

      const action: Action = { type: 'SELECT_PIECE', index: 0 };
      const newState = gameReducer(state, action);

      expect(newState.selectedCell).toBe(0);
    });

    it('should ignore selecting an empty cell or opponent piece', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', 'PLAYER2', null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER1'
      };

      // Empty cell
      let newState = gameReducer(state, { type: 'SELECT_PIECE', index: 2 });
      expect(newState.selectedCell).toBeNull();

      // Opponent piece
      newState = gameReducer(state, { type: 'SELECT_PIECE', index: 1 });
      expect(newState.selectedCell).toBeNull();
    });
  });

  describe('MOVE_PIECE action', () => {
    it('should ignore MOVE_PIECE when not in MOVEMENT phase or no cell selected', () => {
      const state: GameState = { ...INITIAL_STATE, phase: 'PLACEMENT', selectedCell: 0 };
      const action: Action = { type: 'MOVE_PIECE', to: 1 };
      let newState = gameReducer(state, action);
      expect(newState).toEqual(state);

      const state2: GameState = { ...INITIAL_STATE, phase: 'MOVEMENT', selectedCell: null };
      newState = gameReducer(state2, action);
      expect(newState).toEqual(state2);
    });

    it('should move a piece and switch player', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', null, null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER1',
        selectedCell: 0
      };

      // Move 0 -> 1 is valid (adjacent)
      const action: Action = { type: 'MOVE_PIECE', to: 1 };
      const newState = gameReducer(state, action);

      expect(newState.board[0]).toBeNull();
      expect(newState.board[1]).toBe('PLAYER1');
      expect(newState.currentPlayer).toBe('PLAYER2');
      expect(newState.selectedCell).toBeNull();
      expect(newState.history.length).toBe(1);
    });

    it('should ignore invalid move', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', null, null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER1',
        selectedCell: 0
      };

      // Move 0 -> 2 is invalid (not adjacent)
      const action: Action = { type: 'MOVE_PIECE', to: 2 };
      const newState = gameReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('should detect win on movement', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        // Player 1 pieces at 0, 1. Empty at 2. Moving 8 -> 2 will win
        board: ['PLAYER1', 'PLAYER1', null, 'PLAYER2', 'PLAYER2', 'PLAYER2', null, null, 'PLAYER1'],
        currentPlayer: 'PLAYER1',
        selectedCell: 8
      };

      const newState = gameReducer(state, { type: 'MOVE_PIECE', to: 2 });

      expect(newState.phase).toBe('GAME_OVER');
      expect(newState.winner).toBe('PLAYER1');
    });

    it('should detect draw by repetition', () => {
      // Simulate threefold repetition
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', null, null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER1',
        selectedCell: 0
      };

      // The new state we'll be entering
      const newBoard = [null, 'PLAYER1', null, null, null, null, null, null, null];
      const stateStr = JSON.stringify({ board: newBoard, player: 'PLAYER1' });

      // Setup history so that we've seen the upcoming state 2 times already
      // The 3rd time will trigger the draw
      state.history = [stateStr, 'other1', stateStr, 'other2'];

      const newState = gameReducer(state, { type: 'MOVE_PIECE', to: 1 });

      expect(newState.phase).toBe('GAME_OVER');
      expect(newState.winner).toBe('DRAW');
    });
  });

  describe('CPU_MOVE action', () => {
    it('should handle CPU placement', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'PLACEMENT',
        currentPlayer: 'PLAYER2'
      };

      const action: Action = { type: 'CPU_MOVE', from: null, to: 0 };
      const newState = gameReducer(state, action);

      expect(newState.board[0]).toBe('PLAYER2');
      expect(newState.piecesCount.PLAYER2).toBe(1);
      expect(newState.currentPlayer).toBe('PLAYER1');
      expect(newState.history.length).toBe(1);
    });

    it('should handle CPU movement', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER2', null, null, null, null, null, null, null, null],
        currentPlayer: 'PLAYER2'
      };

      const action: Action = { type: 'CPU_MOVE', from: 0, to: 1 };
      const newState = gameReducer(state, action);

      expect(newState.board[0]).toBeNull();
      expect(newState.board[1]).toBe('PLAYER2');
      expect(newState.currentPlayer).toBe('PLAYER1');
    });

    it('should transition to MOVEMENT phase after CPU places last piece', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'PLACEMENT',
        // Make sure pieces placed don't form a winning line
        board: ['PLAYER1', 'PLAYER1', null, 'PLAYER2', 'PLAYER2', null, 'PLAYER1', null, null],
        piecesCount: { PLAYER1: 3, PLAYER2: 2 },
        currentPlayer: 'PLAYER2',
        history: ['state1', 'state2', 'state3', 'state4', 'state5']
      };

      // CPU places 3rd piece at index 8
      const newState = gameReducer(state, { type: 'CPU_MOVE', from: null, to: 8 });

      expect(newState.phase).toBe('MOVEMENT');
      expect(newState.piecesCount.PLAYER2).toBe(3);
      expect(newState.currentPlayer).toBe('PLAYER1');
    });
  });

  describe('SET_GAME_MODE action', () => {
    it('should change game mode and reset state', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        phase: 'MOVEMENT',
        board: ['PLAYER1', null, null, null, null, null, null, null, null]
      };

      const action: Action = { type: 'SET_GAME_MODE', mode: 'HvH' };
      const newState = gameReducer(state, action);

      expect(newState.gameMode).toBe('HvH');
      expect(newState.phase).toBe('PLACEMENT');
      expect(newState.board).toEqual(Array(9).fill(null));
    });
  });

  describe('RESET_GAME action', () => {
    it('should reset game but keep current mode', () => {
      const state: GameState = {
        ...INITIAL_STATE,
        gameMode: 'ONLINE',
        phase: 'GAME_OVER',
        winner: 'PLAYER1',
        board: ['PLAYER1', 'PLAYER1', 'PLAYER1', null, null, null, null, null, null]
      };

      const action: Action = { type: 'RESET_GAME' };
      const newState = gameReducer(state, action);

      expect(newState.gameMode).toBe('ONLINE');
      expect(newState.phase).toBe('PLACEMENT');
      expect(newState.winner).toBeNull();
      expect(newState.board).toEqual(Array(9).fill(null));
    });
  });
});
