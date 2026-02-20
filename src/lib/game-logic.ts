export type Player = 'PLAYER' | 'CPU';
export type Phase = 'PLACEMENT' | 'MOVEMENT' | 'GAME_OVER';
export type Winner = Player | 'DRAW' | null;

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  phase: Phase;
  winner: Winner;
  piecesCount: { [key in Player]: number };
  selectedCell: number | null; // For UI selection
  history: string[]; // For detecting repetitive loops (optional but good to have)
}

// 0-7 are outer circle, 8 is center
// Connectivity: Center (8) connected to all outer points. Outer points form a circle.
export const ADJACENCY: { [key: number]: number[] } = {
  0: [1, 7, 8],
  1: [0, 2, 8],
  2: [1, 3, 8],
  3: [2, 4, 8],
  4: [3, 5, 8],
  5: [4, 6, 8],
  6: [5, 7, 8],
  7: [6, 0, 8],
  8: [0, 1, 2, 3, 4, 5, 6, 7],
};

export const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'PLAYER',
  phase: 'PLACEMENT',
  winner: null,
  piecesCount: { PLAYER: 0, CPU: 0 },
  selectedCell: null,
  history: [],
};

export function isValidPlacement(board: (Player | null)[], index: number): boolean {
  return board[index] === null;
}

export function isValidMovement(board: (Player | null)[], from: number, to: number): boolean {
  if (board[from] === null || board[to] !== null) return false;
  if (!ADJACENCY[from].includes(to)) return false;
  return true;
}

export function getPossibleMoves(state: GameState): { from: number | null, to: number }[] {
  const moves: { from: number | null, to: number }[] = [];
  const { board, currentPlayer, phase } = state;

  if (phase === 'PLACEMENT') {
    for (let i = 0; i < 9; i++) {
      if (isValidPlacement(board, i)) {
        moves.push({ from: null, to: i });
      }
    }
  } else if (phase === 'MOVEMENT') {
    for (let i = 0; i < 9; i++) {
      if (board[i] === currentPlayer) {
        const neighbors = ADJACENCY[i];
        for (const neighbor of neighbors) {
          if (isValidMovement(board, i, neighbor)) {
            moves.push({ from: i, to: neighbor });
          }
        }
      }
    }
  }
  return moves;
}

export function getNextPlayer(current: Player): Player {
  return current === 'PLAYER' ? 'CPU' : 'PLAYER';
}

export const WINNING_LINES: number[][] = [
  // Circle edge
  [0, 1, 2],
  [1, 2, 3],
  [2, 3, 4],
  [3, 4, 5],
  [4, 5, 6],
  [5, 6, 7],
  [6, 7, 0],
  [7, 0, 1],
  // Center diameter
  [0, 8, 4],
  [1, 8, 5],
  [2, 8, 6],
  [3, 8, 7],
];

export function checkWin(board: (Player | null)[]): Winner {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Winner;
    }
  }
  return null;
}

export function isBlocked(state: GameState): boolean {
  if (state.phase !== 'MOVEMENT') return false;
  const moves = getPossibleMoves(state);
  return moves.length === 0;
}

export function checkRepetition(history: string[], currentBoard: (Player | null)[], currentPlayer: Player): boolean {
  const currentStateString = JSON.stringify({ board: currentBoard, player: currentPlayer });
  const count = history.filter(s => s === currentStateString).length;
  // If the current state has occurred 2 times before (total 3), it's a draw
  return count >= 2;
}
