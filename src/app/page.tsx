'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { GameState, Phase, INITIAL_STATE, getNextPlayer, checkWin, isValidPlacement, isValidMovement } from '@/lib/game-logic';
import { getBestMove } from '@/lib/ai';
import { Board } from '@/components/game/Board';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Modal } from '@/components/ui/Modal';

type Action =
  | { type: 'PLACE_PIECE'; index: number }
  | { type: 'SELECT_PIECE'; index: number }
  | { type: 'MOVE_PIECE'; to: number }
  | { type: 'CPU_MOVE'; from: number | null; to: number }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'PLACE_PIECE': {
      if (state.phase !== 'PLACEMENT') return state;
      const { index } = action;
      if (!isValidPlacement(state.board, index)) return state;

      const newBoard = [...state.board];
      newBoard[index] = state.currentPlayer;
      const newPiecesCount = { ...state.piecesCount, [state.currentPlayer]: state.piecesCount[state.currentPlayer] + 1 };

      let newPhase: Phase = state.phase;
      if (newPiecesCount.PLAYER === 3 && newPiecesCount.CPU === 3) {
        newPhase = 'MOVEMENT';
      }

      const winner = checkWin(newBoard);

      return {
        ...state,
        board: newBoard,
        piecesCount: newPiecesCount,
        phase: winner ? 'GAME_OVER' : newPhase,
        winner: winner,
        currentPlayer: getNextPlayer(state.currentPlayer),
      };
    }
    case 'SELECT_PIECE': {
      if (state.phase !== 'MOVEMENT') return state;
      if (state.board[action.index] !== state.currentPlayer) return state;
      return { ...state, selectedCell: action.index };
    }
    case 'MOVE_PIECE': {
      if (state.phase !== 'MOVEMENT') return state;
      if (state.selectedCell === null) return state;

      const from = state.selectedCell;
      const to = action.to;

      if (!isValidMovement(state.board, from, to)) return state;

      const newBoard = [...state.board];
      newBoard[from] = null;
      newBoard[to] = state.currentPlayer;

      const winner = checkWin(newBoard);

      return {
        ...state,
        board: newBoard,
        selectedCell: null,
        currentPlayer: getNextPlayer(state.currentPlayer),
        winner: winner,
        phase: winner ? 'GAME_OVER' : state.phase,
      };
    }
    case 'CPU_MOVE': {
      const { from, to } = action;
      const newBoard = [...state.board];
      const newPiecesCount = { ...state.piecesCount };

      if (from === null) {
        // Placement
        newBoard[to] = state.currentPlayer;
        newPiecesCount[state.currentPlayer]++;
      } else {
        // Movement
        newBoard[from] = null;
        newBoard[to] = state.currentPlayer;
      }

      let newPhase: Phase = state.phase;
      if (state.phase === 'PLACEMENT' && newPiecesCount.PLAYER === 3 && newPiecesCount.CPU === 3) {
        newPhase = 'MOVEMENT';
      }

      const winner = checkWin(newBoard);

      return {
        ...state,
        board: newBoard,
        piecesCount: newPiecesCount,
        currentPlayer: getNextPlayer(state.currentPlayer),
        winner: winner,
        phase: winner ? 'GAME_OVER' : newPhase,
      };
    }
    case 'RESET_GAME':
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // AI Turn
  useEffect(() => {
    if (state.currentPlayer === 'CPU' && state.phase !== 'GAME_OVER') {
      const timer = setTimeout(() => {
        // Run AI in a simplified way
        const move = getBestMove(state, 3); // Depth 3
        if (move) {
          dispatch({ type: 'CPU_MOVE', from: move.from, to: move.to });
        }
      }, 500); // 500ms delay for "thinking"
      return () => clearTimeout(timer);
    }
  }, [state]); // Dependencies need care to avoid loops, but should be fine as dispatch changes state

  const handleCellClick = useCallback((index: number) => {
    if (state.phase === 'GAME_OVER' || state.currentPlayer === 'CPU') return;

    if (state.phase === 'PLACEMENT') {
      dispatch({ type: 'PLACE_PIECE', index });
    } else {
      // Movement Phase
      if (state.board[index] === 'PLAYER') {
        dispatch({ type: 'SELECT_PIECE', index });
      } else if (state.selectedCell !== null && state.board[index] === null) {
        dispatch({ type: 'MOVE_PIECE', to: index });
      }
    }
  }, [state.phase, state.currentPlayer, state.board, state.selectedCell]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <GlassPanel className="w-full flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">ROTA</h1>
            <div className="flex gap-4 items-center">
                <div className={`text-sm font-bold ${state.currentPlayer === 'PLAYER' ? 'text-primary' : 'text-gray-500'}`}>PLAYER</div>
                <div className="text-gray-600">VS</div>
                <div className={`text-sm font-bold ${state.currentPlayer === 'CPU' ? 'text-secondary' : 'text-gray-500'}`}>CPU</div>
            </div>
            <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="glass" className="text-sm py-2 px-4">Restart</Button>
        </GlassPanel>

        <div className="w-full flex justify-center">
            <Board gameState={state} onCellClick={handleCellClick} />
        </div>

        <div className="text-center text-gray-400 text-sm h-6">
            {state.phase === 'PLACEMENT' && "Place your pieces (3 each)"}
            {state.phase === 'MOVEMENT' && "Move your pieces to adjacent empty spots"}
        </div>
      </div>

      <Modal isOpen={state.phase === 'GAME_OVER'}>
        <div className="flex flex-col gap-4 items-center">
            <h2 className="text-4xl font-bold mb-4">
                {state.winner === 'PLAYER' && <span className="text-primary">VICTORY</span>}
                {state.winner === 'CPU' && <span className="text-secondary">DEFEAT</span>}
                {state.winner === 'DRAW' && <span className="text-white">DRAW</span>}
            </h2>
            <p className="text-gray-300">
                {state.winner === 'PLAYER' ? "You outsmarted the machine!" : "Better luck next time."}
            </p>
            <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="primary">Play Again</Button>
        </div>
      </Modal>
    </main>
  );
}
