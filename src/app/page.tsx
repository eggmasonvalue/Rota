'use client';

import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { GameState, Phase, INITIAL_STATE, getNextPlayer, checkWin, isValidPlacement, isValidMovement, isBlocked, checkRepetition, Player } from '@/lib/game-logic';
import { Difficulty } from '@/lib/ai';
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

// Helper to handle turn switching and win/loss/block/draw detection
function endTurn(state: GameState, newBoard: (Player | null)[], newPiecesCount: { [key in Player]: number }, nextPhase: Phase): GameState {
  const winner = checkWin(newBoard);
  const nextPlayer = getNextPlayer(state.currentPlayer);

  const newHistory = [...state.history, JSON.stringify({ board: newBoard, player: state.currentPlayer })];

  if (winner) {
    return {
      ...state,
      board: newBoard,
      piecesCount: newPiecesCount,
      phase: 'GAME_OVER',
      winner,
      currentPlayer: nextPlayer,
      selectedCell: null,
      history: newHistory
    };
  }

  // Check for 3-fold repetition (DRAW)
  if (nextPhase === 'MOVEMENT' && checkRepetition(state.history, newBoard, state.currentPlayer)) {
      return {
        ...state,
        board: newBoard,
        piecesCount: newPiecesCount,
        phase: 'GAME_OVER',
        winner: 'DRAW',
        currentPlayer: nextPlayer,
        selectedCell: null,
        history: newHistory
      };
  }

  // Check if next player is blocked (only in MOVEMENT phase)
  if (nextPhase === 'MOVEMENT') {
    const nextStateCheck: GameState = {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      phase: 'MOVEMENT',
      piecesCount: newPiecesCount,
      winner: null,
      selectedCell: null,
      history: newHistory
    };

    if (isBlocked(nextStateCheck)) {
      return {
        ...state,
        board: newBoard,
        piecesCount: newPiecesCount,
        phase: 'GAME_OVER',
        winner: state.currentPlayer, // The player who just moved wins by blocking
        currentPlayer: nextPlayer,
        selectedCell: null,
        history: newHistory
      };
    }
  }

  return {
    ...state,
    board: newBoard,
    piecesCount: newPiecesCount,
    phase: nextPhase,
    winner: null,
    currentPlayer: nextPlayer,
    selectedCell: null,
    history: newHistory
  };
}


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

      return endTurn(state, newBoard, newPiecesCount, newPhase);
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

      return endTurn(state, newBoard, state.piecesCount, state.phase);
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

      return endTurn(state, newBoard, newPiecesCount, newPhase);
    }
    case 'RESET_GAME':
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker(new URL('../worker/ai.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { move } = event.data;
      if (move) {
         dispatch({ type: 'CPU_MOVE', from: move.from, to: move.to });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // AI Turn
  useEffect(() => {
    if (state.currentPlayer === 'CPU' && state.phase !== 'GAME_OVER') {
       // Send state to worker
       if (workerRef.current) {
          // Small delay for UX so it doesn't feel instant
          setTimeout(() => {
             workerRef.current?.postMessage({ state, difficulty });
          }, 500);
       }
    }
  }, [state, difficulty]);

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
        <GlassPanel className="w-full flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">ROTA</h1>

            <div className="flex gap-4 items-center">
                <div className={`text-sm font-bold ${state.currentPlayer === 'PLAYER' ? 'text-primary' : 'text-gray-500'}`}>PLAYER</div>
                <div className="text-gray-600">VS</div>
                <div className={`text-sm font-bold ${state.currentPlayer === 'CPU' ? 'text-secondary' : 'text-gray-500'}`}>CPU</div>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">DIFFICULTY:</label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-gray-200 outline-none focus:border-primary/50"
                    disabled={state.phase !== 'PLACEMENT' || state.piecesCount.PLAYER > 0}
                >
                    <option value="EASY" className="bg-black text-gray-200">EASY</option>
                    <option value="MEDIUM" className="bg-black text-gray-200">MEDIUM</option>
                    <option value="HARD" className="bg-black text-gray-200">HARD</option>
                </select>
                <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="glass" className="text-sm py-2 px-4 ml-2">Restart</Button>
            </div>
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
                {state.winner === 'DRAW' && "It seems we are evenly matched."}
            </p>
            <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="primary">Play Again</Button>
        </div>
      </Modal>
    </main>
  );
}
