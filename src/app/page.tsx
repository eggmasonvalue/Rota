'use client';

import { useReducer, useEffect, useCallback, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameState, Phase, INITIAL_STATE, getNextPlayer, checkWin, isValidPlacement, isValidMovement, isBlocked, checkRepetition, Player, GameMode, Action, Difficulty } from '@/lib/game-logic';
import { Board } from '@/components/game/Board';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Modal } from '@/components/ui/Modal';
import { HowToPlay } from '@/components/game/HowToPlay';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { generateUUID } from '@/lib/utils';
// Force Turbopack clean update for Lucide-React imports
import { Copy, Users, Volume2, VolumeX, Vibrate, Sun, Moon } from 'lucide-react';

function gameReducer(state: GameState, action: Action): GameState {
  // Game logic helper
  const endTurn = (newState: GameState, newBoard: (Player | null)[], newPiecesCount: { [key in Player]: number }, nextPhase: Phase): GameState => {
     const winner = checkWin(newBoard);
     const nextPlayer = getNextPlayer(newState.currentPlayer);
     const newHistory = [...newState.history, JSON.stringify({ board: newBoard, player: newState.currentPlayer })];

     if (winner) {
        return { ...newState, board: newBoard, piecesCount: newPiecesCount, phase: 'GAME_OVER', winner, currentPlayer: nextPlayer, selectedCell: null, history: newHistory };
     }

     if (nextPhase === 'MOVEMENT' && checkRepetition(newHistory, newBoard, newState.currentPlayer)) {
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

function GameContent() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [difficulty, setDifficulty] = useState<Difficulty>('EQUES');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Theme Toggle Logic
  useEffect(() => {
    // The blocking script in layout.tsx already applied .dark before first paint.
    // Here we just sync React state with whatever the DOM already has.
    const isDark = document.documentElement.classList.contains('dark');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDarkMode(isDark);

    // Enable smooth transitions NOW (after mount), so they only fire on
    // user-triggered toggles — not on the initial page load.
    document.body.classList.add('theme-ready');
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    playClick();
  };


  // Sync roomId from URL on mount
  useEffect(() => {
    const room = searchParams.get('room');
    const modeParam = searchParams.get('mode');

    if (room) {
      // Basic sanitization: alphanumeric and hyphens only
      if (/^[a-zA-Z0-9-]+$/.test(room)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRoomId(room);
        if (state.gameMode !== 'ONLINE') {
           dispatch({ type: 'SET_GAME_MODE', mode: 'ONLINE' });
        }
      } else {
        console.warn('Invalid Room ID in URL');
      }
    } else {
       // Check for explicit mode parameter (e.g. returning from Online)
       if (modeParam === 'HvH' || modeParam === 'HvC') {
         if (state.gameMode !== modeParam) {
            dispatch({ type: 'SET_GAME_MODE', mode: modeParam as GameMode });
         }
       } else {
         // If no room in URL and no mode param, ensure we are not stuck in ONLINE mode.
         if (state.gameMode === 'ONLINE') {
           dispatch({ type: 'SET_GAME_MODE', mode: 'HvC' });
         }
       }
    }
  }, [searchParams, state.gameMode]);

  // Stable reference to state for callback
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const onActionReceived = useCallback((action: Action, fromPlayer: Player) => {
     const currentState = stateRef.current;
     // Security/Validity Check
     // Only accept moves if it's that player's turn

     if (action.type === 'RESET_GAME') {
        // Only allow reset if the game is over to prevent griefing
        if (currentState.phase === 'GAME_OVER') {
           dispatch(action);
        } else {
           console.warn('Blocked premature RESET_GAME action');
        }
        return;
     }

     if (fromPlayer === currentState.currentPlayer) {
        dispatch(action);
     } else {
        console.warn(`Blocked action from ${fromPlayer} during ${currentState.currentPlayer}'s turn`);
     }
  }, []);

  const { myPlayer, connectionStatus, onlineUsersCount, sendAction } = useOnlineGame(roomId, onActionReceived);

  // Sound Effects
  const { playPlace, playMove, playWin, playLoss, playDraw, playClick, feedbackMode, cycleFeedbackMode } = useSoundEffects();
  const prevHistoryLength = useRef(state.history.length);
  const prevPhaseRef = useRef<Phase>(state.phase);

  // Trigger move/placement sounds based on state changes
  useEffect(() => {
    // Check if a move was just made (history grew)
    if (state.history.length > prevHistoryLength.current) {
        // Use the *previous* phase to determine the sound.
        // If we were in PLACEMENT and history grew, a piece was placed.
        // If we were in MOVEMENT and history grew, a piece was moved.
        if (prevPhaseRef.current === 'PLACEMENT') {
            playPlace();
        } else if (prevPhaseRef.current === 'MOVEMENT') {
            playMove();
        }
    }

    // Update refs for next render
    prevHistoryLength.current = state.history.length;
    prevPhaseRef.current = state.phase;
  }, [state.history.length, state.phase, playPlace, playMove]);

  // Trigger game over sounds
  useEffect(() => {
    if (state.winner) {
        if (state.winner === 'DRAW') {
            playDraw();
        } else if (state.gameMode === 'HvC') {
            if (state.winner === 'PLAYER1') playWin();
            else playLoss();
        } else if (state.gameMode === 'ONLINE') {
            if (myPlayer === state.winner) playWin();
            else if (myPlayer === 'SPECTATOR') playDraw(); // Neutral for spectator
            else playLoss();
        } else {
            playWin(); // HvH
        }
    }
  }, [state.winner, state.gameMode, myPlayer, playWin, playLoss, playDraw]);

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
          }, 800);
       }
    }
  }, [state, difficulty]);

  const handleCellClick = useCallback((index: number) => {
    if (state.phase === 'GAME_OVER') return;

    // Prevent interaction if it's CPU's turn in HvC mode
    if (state.gameMode === 'HvC' && state.currentPlayer === 'PLAYER2') return;

    // Prevent interaction if online and not my turn
    if (state.gameMode === 'ONLINE') {
        if (!myPlayer || myPlayer === 'SPECTATOR') return; // Spectators can't play
        if (myPlayer !== state.currentPlayer) return; // Not my turn
        // Ensure opponent is present? Optional, but good UX.
        // For now, allow placing if you are assigned a role.
    }

    let action: Action | null = null;
    if (state.phase === 'PLACEMENT') {
      action = { type: 'PLACE_PIECE', index };
    } else {
      if (state.board[index] === state.currentPlayer) {
        action = { type: 'SELECT_PIECE', index };
      } else if (state.selectedCell !== null && state.board[index] === null) {
        action = { type: 'MOVE_PIECE', to: index };
      }
    }

    if (action) {
      dispatch(action);
      if (state.gameMode === 'ONLINE') {
        sendAction(action);
      }
    }
  }, [state, myPlayer, sendAction]);

  const handleModeChange = (mode: GameMode) => {
    if (mode === 'ONLINE') {
      const newRoomId = generateUUID();
      setRoomId(newRoomId);
      router.push(`/?room=${newRoomId}`);
      dispatch({ type: 'SET_GAME_MODE', mode: 'ONLINE' });
    } else if (state.gameMode === 'ONLINE') {
      // If we are currently in ONLINE mode, we must force a hard reload to clear Supabase subscriptions cleanly
      setRoomId(null);
      window.location.href = `/?mode=${mode}`;
    } else {
      // Switching between local modes (HvC <-> HvH) - no reload needed
      setRoomId(null);
      dispatch({ type: 'SET_GAME_MODE', mode });
      // Update URL so refresh works
      router.replace(`/?mode=${mode}`);
    }
  };

  const handleRestart = () => {
    // In Online mode, restrict restarting to when the game is over
    if (state.gameMode === 'ONLINE' && state.phase !== 'GAME_OVER') {
        return;
    }
    // Prevent spectators from restarting
    if (state.gameMode === 'ONLINE' && myPlayer === 'SPECTATOR') {
        return;
    }

    const action: Action = { type: 'RESET_GAME' };
    dispatch(action);
    if (state.gameMode === 'ONLINE') {
        sendAction(action);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isPlayer1Turn = state.currentPlayer === 'PLAYER1';
  const isPlayer2Turn = state.currentPlayer === 'PLAYER2';

  // Helper for dynamic difficulty name display
  const getOpponentName = () => {
      if (state.gameMode === 'HvH') return 'PLAYER 2';
      if (state.gameMode === 'ONLINE') return 'PLAYER 2';
      // Solo mode (HvC)
      switch (difficulty) {
          case 'PLEBEIAN': return 'PLEBEIAN';
          case 'MERCHANT': return 'MERCHANT';
          case 'EQUES': return 'EQUES';
          case 'SENATOR': return 'SENATOR';
          case 'CONSUL': return 'CONSUL';
          default: return 'CPU';
      }
  };

  // Helper for game over messages
  const getWinMessage = () => {
      if (state.gameMode !== 'HvC') {
         // Rotating victory messages for PVP
         const quotes = [
            "The Senate acknowledges your triumph.",
            "Rome salutes the victor.",
            "Glory to the winner."
         ];
         return quotes[state.history.length % quotes.length];
      }

      // Solo Mode Custom Messages
      switch(difficulty) {
          case 'PLEBEIAN': return "You have risen above the rabble.";
          case 'MERCHANT': return "Your strategy pays dividends.";
          case 'EQUES': return "You command respect among the elite!";
          case 'SENATOR': return "The Senate stands in awe of your strategy.";
          case 'CONSUL': return "History will remember this triumph.";
          default: return "VICTORY";
      }
  };

  const getLossMessage = () => {
      if (state.gameMode !== 'HvC') {
         const quotes = [
            "The Senate acknowledges the victor.",
            "A hard-fought battle in the Forum.",
            "Fate has favored the bold."
         ];
         return quotes[state.history.length % quotes.length];
      }

      // Solo Mode Custom Messages
      switch(difficulty) {
          case 'PLEBEIAN': return "Defeated by a pleb? Humiliating!";
          case 'MERCHANT': return "You've been swindled out of victory.";
          case 'EQUES': return "The equestrian order remains exclusive.";
          case 'SENATOR': return "Outwitted by a seasoned statesman.";
          case 'CONSUL': return "The Consul's authority is absolute.";
          default: return "DEFEAT";
      }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-x-hidden font-body transition-colors duration-500">

      {/* Background Ambience - Subtle tint from the primary/secondary palette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-5 pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <GlassPanel className="w-full flex justify-between items-center flex-wrap gap-4 px-8 py-6">
            {/* Title */}
            <h1 className="text-4xl font-heading font-bold text-foreground tracking-widest drop-shadow-sm">
              ROTA
            </h1>

            {/* Turn Indicator */}
            <div className="flex gap-6 items-center text-lg font-heading tracking-wide">
                <div className={`transition-all duration-300 ${isPlayer1Turn ? 'text-primary font-bold drop-shadow-[0_0_8px_var(--color-primary)] scale-110' : 'text-foreground/50'}`}>
                  {state.gameMode === 'HvH' || state.gameMode === 'ONLINE' ? 'PLAYER 1' : 'YOU'}
                </div>
                <div className="text-foreground/40 text-sm">VS</div>
                <div className={`transition-all duration-300 ${isPlayer2Turn ? 'text-secondary font-bold drop-shadow-[0_0_8px_var(--color-secondary)] scale-110' : 'text-foreground/50'}`}>
                   {getOpponentName()}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-end justify-center sm:justify-end gap-3 w-full sm:w-auto">
                 {/* Game Mode Selector */}
                 <div className="flex flex-col gap-1">
                   <label className="text-xs text-foreground/60 font-heading uppercase tracking-widest">OPPONENT</label>
                   <select
                      value={state.gameMode}
                      onChange={(e) => {
                          playClick();
                          handleModeChange(e.target.value as GameMode);
                      }}
                      className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-1 text-sm text-foreground font-body outline-none focus:border-secondary hover:bg-[var(--glass-border)]/10 transition-colors cursor-pointer"
                      disabled={state.phase !== 'PLACEMENT' || (state.piecesCount.PLAYER1 > 0 || state.piecesCount.PLAYER2 > 0)}
                  >
                      <option value="HvC" className="bg-background text-foreground">Solo</option>
                      <option value="HvH" className="bg-background text-foreground">Versus</option>
                      <option value="ONLINE" className="bg-background text-foreground">Online</option>
                  </select>
                 </div>

                {/* Difficulty Selector (Only visible/enabled in HvC) */}
                {state.gameMode === 'HvC' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-foreground/60 font-heading uppercase tracking-widest">Rank</label>
                    <select
                        value={difficulty}
                        onChange={(e) => {
                            playClick();
                            setDifficulty(e.target.value as Difficulty);
                        }}
                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-1 text-sm text-foreground font-body outline-none focus:border-secondary hover:bg-[var(--glass-border)]/10 transition-colors cursor-pointer"
                        disabled={state.phase !== 'PLACEMENT' || (state.piecesCount.PLAYER1 > 0)}
                    >
                        <option value="PLEBEIAN" className="bg-background text-foreground">Plebeian</option>
                        <option value="MERCHANT" className="bg-background text-foreground">Merchant</option>
                        <option value="EQUES" className="bg-background text-foreground">Eques</option>
                        <option value="SENATOR" className="bg-background text-foreground">Senator</option>
                        <option value="CONSUL" className="bg-background text-foreground">Consul</option>
                    </select>
                  </div>
                )}

                {/* Feedback Toggle */}
                <button
                    suppressHydrationWarning
                    onClick={() => {
                        cycleFeedbackMode();
                        playClick();
                    }}
                    className="p-2 rounded-xl border border-[var(--glass-border)] hover:border-secondary/80 text-foreground/80 hover:text-foreground transition-colors self-end mb-0.5"
                    title={
                        feedbackMode === 'SOUND_AND_HAPTICS' ? "Sound & Haptics On" :
                        feedbackMode === 'SOUND_ONLY' ? "Sound Only" :
                        feedbackMode === 'HAPTICS_ONLY' ? "Haptics Only" :
                        "Feedback Off"
                    }
                >
                    {feedbackMode === 'SOUND_AND_HAPTICS' ? (
                        <div className="flex items-center -space-x-1">
                            <Volume2 size={18} />
                            <Vibrate size={14} className="opacity-80" />
                        </div>
                    ) :
                     feedbackMode === 'SOUND_ONLY' ? <Volume2 size={20} /> :
                     feedbackMode === 'HAPTICS_ONLY' ? <Vibrate size={20} /> :
                     <VolumeX size={20} />}
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-[var(--glass-border)] hover:border-secondary/80 text-foreground/80 hover:text-foreground transition-colors self-end mb-0.5"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <Button
                  onClick={() => {
                      playClick();
                      handleRestart();
                  }}
                  variant="glass"
                  className="text-sm py-2 px-6 font-heading tracking-wider hover:text-secondary border-[var(--glass-border)] hover:border-secondary/80 h-full self-end mb-0.5"
                >
                  Restart
                </Button>
            </div>
        </GlassPanel>

        {/* Online Status Bar */}
        {state.gameMode === 'ONLINE' && (
          <GlassPanel className="w-full flex justify-between items-center px-6 py-3">
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-[var(--glass-border)] shadow-[0_0_8px_var(--glass-border)]' : 'bg-[var(--primary)] animate-pulse'}`} />
                <span className="text-foreground/80 text-sm font-heading tracking-wider">
                  {connectionStatus === 'CONNECTED'
                    ? (myPlayer ? (myPlayer === 'SPECTATOR' ? 'WITNESSING HISTORY...' : `YOU ARE ${myPlayer === 'PLAYER1' ? 'PLAYER 1' : 'PLAYER 2'}`) : 'ENTERING THE FORUM...')
                    : 'SEEKING A WORTHY CHALLENGER...'}
                </span>
                {onlineUsersCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-foreground/60 ml-2">
                    <Users size={14} /> {onlineUsersCount} Online
                  </span>
                )}
             </div>

             <div className="flex items-center gap-2">
               <button
                  onClick={() => {
                      playClick();
                      copyLink();
                  }}
                  className="flex items-center gap-2 text-xs text-foreground/80 hover:text-foreground transition-colors uppercase tracking-widest font-heading border border-[var(--glass-border)] rounded-lg px-3 py-1.5 hover:bg-[var(--glass-border)]/10"
               >
                 {copied ? 'COPIED' : 'COPY LINK'} <Copy size={14} />
               </button>
             </div>
          </GlassPanel>
        )}

        {/* Game Board */}
        <div className="w-full flex justify-center relative mb-0">
            {/* Ambient Glow behind board */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--glass-border)] opacity-10 rounded-full blur-3xl pointer-events-none" />
            <Board gameState={state} onCellClick={handleCellClick} />
        </div>

        {/* Status Message - Moved closer to board */}
        <div className="text-center h-8 -mt-12 relative z-20 pointer-events-none">
            <p className="text-foreground/90 font-heading text-xl tracking-wider animate-pulse drop-shadow-md">
              {state.phase === 'PLACEMENT' && "Place your pieces (3 each)"}
              {state.phase === 'MOVEMENT' && "Move a piece to an adjacent empty spot"}
            </p>
        </div>

        {/* How to Play Section */}
        <HowToPlay />
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={state.phase === 'GAME_OVER'}>
        <div className="flex flex-col gap-6 items-center p-4">
            <h2 className="text-5xl font-heading font-bold mb-2 tracking-widest text-center flex items-center justify-center gap-2">
                {state.winner === 'PLAYER1' && (
                  state.gameMode === 'HvH' || state.gameMode === 'ONLINE' ? (
                     <span className="text-primary drop-shadow-[0_0_15px_var(--color-primary)]">
                        PLAYER <span className="inline-block scale-110 drop-shadow-[0_0_25px_var(--color-primary)] font-black mx-1">1</span> WINS
                     </span>
                  ) : (
                     <span className="text-primary drop-shadow-[0_0_15px_var(--color-primary)]">VICTORY</span>
                  )
                )}

                {state.winner === 'PLAYER2' && (
                   state.gameMode === 'HvH' || state.gameMode === 'ONLINE' ? (
                     <span className="text-secondary drop-shadow-[0_0_15px_var(--color-secondary)]">
                        PLAYER <span className="inline-block scale-110 drop-shadow-[0_0_25px_var(--color-secondary)] font-black mx-1">2</span> WINS
                     </span>
                   ) : (
                     <span className="text-foreground/50">DEFEAT</span>
                   )
                )}

                {state.winner === 'DRAW' && <span className="text-foreground/80">STALEMATE</span>}
            </h2>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
            <p className="text-xl text-foreground/80 font-body text-center max-w-md">
                {state.winner === 'PLAYER1' ?
                  getWinMessage()
                  : ""
                }
                {state.winner === 'PLAYER2' ?
                  getLossMessage()
                  : ""
                }
                {state.winner === 'DRAW' && "A stalemate in the Curia."}
            </p>
            {(!state.gameMode || state.gameMode !== 'ONLINE' || (myPlayer && myPlayer !== 'SPECTATOR')) && (
              <Button
                onClick={() => {
                    playClick();
                    handleRestart();
                }}
                variant="primary"
                className="mt-4 px-8 py-3 text-lg font-heading tracking-widest bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(var(--color-primary),0.4)]"
              >
                Play Again
              </Button>
            )}
        </div>
      </Modal>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}
