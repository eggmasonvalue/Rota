'use client';

import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { GameState, Phase, INITIAL_STATE, getNextPlayer, checkWin, isValidPlacement, isValidMovement, isBlocked, checkRepetition, Player, GameMode } from '@/lib/game-logic';
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
  | { type: 'RESET_GAME' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_GAME_MODE'; mode: GameMode };

function gameReducer(state: GameState, action: Action): GameState {
  // Game logic helper
  const endTurn = (newState: GameState, newBoard: (Player | null)[], newPiecesCount: { [key in Player]: number }, nextPhase: Phase): GameState => {
     const winner = checkWin(newBoard);
     const nextPlayer = getNextPlayer(newState.currentPlayer);
     const newHistory = [...newState.history, JSON.stringify({ board: newBoard, player: newState.currentPlayer })];

     if (winner) {
        return { ...newState, board: newBoard, piecesCount: newPiecesCount, phase: 'GAME_OVER', winner, currentPlayer: nextPlayer, selectedCell: null, history: newHistory };
     }

     if (nextPhase === 'MOVEMENT' && checkRepetition(newState.history, newBoard, newState.currentPlayer)) {
        return { ...newState, board: newBoard, piecesCount: newPiecesCount, phase: 'GAME_OVER', winner: 'DRAW', currentPlayer: nextPlayer, selectedCell: null, history: newHistory };
     }

     if (nextPhase === 'MOVEMENT') {
        const nextStateCheck: GameState = {
           ...newState,
           board: newBoard,
           currentPlayer: nextPlayer,
           phase: 'MOVEMENT' as Phase,
           piecesCount: newPiecesCount,
           winner: null,
           selectedCell: null,
           history: newHistory
        };
        if (isBlocked(nextStateCheck)) {
           return { ...newState, board: newBoard, piecesCount: newPiecesCount, phase: 'GAME_OVER', winner: newState.currentPlayer, currentPlayer: nextPlayer, selectedCell: null, history: newHistory };
        }
     }

     return { ...newState, board: newBoard, piecesCount: newPiecesCount, phase: nextPhase, winner: null, currentPlayer: nextPlayer, selectedCell: null, history: newHistory };
  };

  switch (action.type) {
    case 'PLACE_PIECE': {
      if (state.phase !== 'PLACEMENT') return state;
      const { index } = action;
      if (!isValidPlacement(state.board, index)) return state;

      const newBoard = [...state.board];
      newBoard[index] = state.currentPlayer;
      const newPiecesCount = { ...state.piecesCount, [state.currentPlayer]: state.piecesCount[state.currentPlayer] + 1 };

      let newPhase: Phase = state.phase;
      if (newPiecesCount.PLAYER1 === 3 && newPiecesCount.PLAYER2 === 3) {
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
        newBoard[to] = state.currentPlayer;
        newPiecesCount[state.currentPlayer]++;
      } else {
        newBoard[from] = null;
        newBoard[to] = state.currentPlayer;
      }

      let newPhase: Phase = state.phase;
      if (state.phase === 'PLACEMENT' && newPiecesCount.PLAYER1 === 3 && newPiecesCount.PLAYER2 === 3) {
        newPhase = 'MOVEMENT';
      }

      return endTurn(state, newBoard, newPiecesCount, newPhase);
    }
    case 'SET_GAME_MODE':
      return { ...INITIAL_STATE, gameMode: action.mode };
    case 'RESET_GAME':
      return { ...INITIAL_STATE, gameMode: state.gameMode };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../worker/ai.worker.ts', import.meta.url));
    workerRef.current.onmessage = (event) => {
      const { move } = event.data;
      if (move) {
         dispatch({ type: 'CPU_MOVE', from: move.from, to: move.to });
      }
    };
    return () => { workerRef.current?.terminate(); };
  }, []);

  // AI Turn Trigger
  useEffect(() => {
    if (state.gameMode === 'HvC' && state.currentPlayer === 'PLAYER2' && state.phase !== 'GAME_OVER') {
       if (workerRef.current) {
          setTimeout(() => {
             workerRef.current?.postMessage({ state, difficulty });
          }, 800); // Increased delay for better pacing
       }
    }
  }, [state, difficulty]);

  const handleCellClick = useCallback((index: number) => {
    if (state.phase === 'GAME_OVER') return;

    // Prevent interaction if it's CPU's turn in HvC mode
    if (state.gameMode === 'HvC' && state.currentPlayer === 'PLAYER2') return;

    if (state.phase === 'PLACEMENT') {
      dispatch({ type: 'PLACE_PIECE', index });
    } else {
      if (state.board[index] === state.currentPlayer) {
        dispatch({ type: 'SELECT_PIECE', index });
      } else if (state.selectedCell !== null && state.board[index] === null) {
        dispatch({ type: 'MOVE_PIECE', to: index });
      }
    }
  }, [state]);

  const isPlayer1Turn = state.currentPlayer === 'PLAYER1';
  const isPlayer2Turn = state.currentPlayer === 'PLAYER2';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-x-hidden overflow-y-auto font-body">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(102,2,60,0.15)_0%,rgba(26,26,46,0)_70%)] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <GlassPanel className="w-full flex justify-between items-center flex-wrap gap-4 px-8 py-6 border-gold/20 shadow-2xl">
            {/* Title - Using Imperial Gold gradient */}
            <h1 className="text-4xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary tracking-widest drop-shadow-sm">
              ROTA
            </h1>

            {/* Turn Indicator - Improved Contrast */}
            <div className="flex gap-6 items-center text-lg font-heading tracking-wide">
                <div className={`transition-all duration-300 ${isPlayer1Turn ? 'text-primary-bright font-bold drop-shadow-[0_0_8px_rgba(208,32,144,0.6)] scale-110' : 'text-gray-500'}`}>
                  {state.gameMode === 'HvH' ? 'PLAYER 1' : 'PLAYER'}
                </div>
                <div className="text-gray-600 text-sm">VS</div>
                <div className={`transition-all duration-300 ${isPlayer2Turn ? 'text-secondary drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-110' : 'text-gray-500'}`}>
                   {state.gameMode === 'HvH' ? 'PLAYER 2' : 'CPU'}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-end justify-center sm:justify-end gap-3 w-full sm:w-auto">
                 {/* Game Mode Selector */}
                 <div className="flex flex-col gap-1">
                   <label className="text-xs text-secondary/70 font-heading uppercase tracking-widest">Mode</label>
                   <select
                      value={state.gameMode}
                      onChange={(e) => dispatch({ type: 'SET_GAME_MODE', mode: e.target.value as GameMode })}
                      className="bg-black/40 border border-secondary/30 rounded-xl px-3 py-1 text-sm text-secondary font-body outline-none focus:border-secondary hover:bg-black/60 transition-colors cursor-pointer"
                      disabled={state.phase !== 'PLACEMENT' || (state.piecesCount.PLAYER1 > 0 || state.piecesCount.PLAYER2 > 0)}
                  >
                      <option value="HvC" className="bg-background text-foreground">Human vs CPU</option>
                      <option value="HvH" className="bg-background text-foreground">Human vs Human</option>
                  </select>
                 </div>

                {/* Difficulty Selector (Only visible/enabled in HvC) */}
                {state.gameMode === 'HvC' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary/70 font-heading uppercase tracking-widest">Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="bg-black/40 border border-secondary/30 rounded-xl px-3 py-1 text-sm text-secondary font-body outline-none focus:border-secondary hover:bg-black/60 transition-colors cursor-pointer"
                        disabled={state.phase !== 'PLACEMENT' || (state.piecesCount.PLAYER1 > 0)}
                    >
                        <option value="EASY" className="bg-background text-foreground">Novice</option>
                        <option value="MEDIUM" className="bg-background text-foreground">Legionary</option>
                        <option value="HARD" className="bg-background text-foreground">Senator</option>
                    </select>
                  </div>
                )}

                <Button
                  onClick={() => dispatch({ type: 'RESET_GAME' })}
                  variant="glass"
                  className="text-sm py-2 px-6 ml-2 font-heading tracking-wider hover:text-secondary border-secondary/30 hover:border-secondary/80 h-full self-end mb-0.5"
                >
                  Restart
                </Button>
            </div>
        </GlassPanel>

        {/* Game Board */}
        <div className="w-full flex justify-center relative">
            {/* Ambient Glow behind board */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
            <Board gameState={state} onCellClick={handleCellClick} />
        </div>

        {/* Status Message */}
        <div className="text-center h-8">
            <p className="text-secondary/80 font-body text-lg italic animate-pulse">
              {state.phase === 'PLACEMENT' && "Place your pieces (3 each)"}
              {state.phase === 'MOVEMENT' && "Move a piece to an adjacent empty spot"}
            </p>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={state.phase === 'GAME_OVER'}>
        <div className="flex flex-col gap-6 items-center p-4">
            <h2 className="text-5xl font-heading font-bold mb-2 tracking-widest text-center">
                {state.winner === 'PLAYER1' && <span className="text-primary drop-shadow-[0_0_15px_rgba(102,2,60,0.8)]">
                  {state.gameMode === 'HvH' ? 'PLAYER 1 WINS' : 'VICTORY'}
                </span>}
                {state.winner === 'PLAYER2' && <span className={state.gameMode === 'HvH' ? "text-secondary drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" : "text-gray-500"}>
                  {state.gameMode === 'HvH' ? 'PLAYER 2 WINS' : 'DEFEAT'}
                </span>}
                {state.winner === 'DRAW' && <span className="text-secondary">STALEMATE</span>}
            </h2>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            <p className="text-xl text-gray-300 font-body text-center max-w-md">
                {state.winner === 'PLAYER1' ?
                  (state.gameMode === 'HvH' ? "Player 1 has conquered the wheel." : "The Senate applauds your strategy. Rome is yours.")
                  : ""
                }
                {state.winner === 'PLAYER2' ?
                  (state.gameMode === 'HvH' ? "Player 2 has conquered the wheel." : "The machine has outmaneuvered you this time.")
                  : ""
                }
                {state.winner === 'DRAW' && "Even the Gods cannot decide a winner."}
            </p>
            <Button
              onClick={() => dispatch({ type: 'RESET_GAME' })}
              variant="primary"
              className="mt-4 px-8 py-3 text-lg font-heading tracking-widest bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(102,2,60,0.4)]"
            >
              Play Again
            </Button>
        </div>
      </Modal>
    </main>
  );
}
