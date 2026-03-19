import { GameState, Player, Phase, Winner, getPossibleMoves, checkWin, getNextPlayer, WINNING_LINES, Difficulty } from './game-logic';

/**
 * Mutates the game state in place to apply a move.
 * Returns the previous phase and winner to allow for undoing the move.
 */
function makeMove(state: GameState, move: { from: number | null, to: number }): { prevPhase: Phase, prevWinner: Winner } {
  const prevPhase = state.phase;
  const prevWinner = state.winner;

  if (move.from === null) {
    // Placement
    state.board[move.to] = state.currentPlayer;
    state.piecesCount[state.currentPlayer]++;

    // Check if placement phase ends
    if (state.piecesCount.PLAYER1 === 3 && state.piecesCount.PLAYER2 === 3) {
      state.phase = 'MOVEMENT';
    }
  } else {
    // Movement
    state.board[move.from] = null;
    state.board[move.to] = state.currentPlayer;
  }

  const winner = checkWin(state.board);
  if (winner) {
    state.phase = 'GAME_OVER';
    state.winner = winner;
  }

  state.currentPlayer = getNextPlayer(state.currentPlayer);
  return { prevPhase, prevWinner };
}

/**
 * Reverts a move on the game state in place.
 */
function undoMove(state: GameState, move: { from: number | null, to: number }, prevPhase: Phase, prevWinner: Winner): void {
  // Revert currentPlayer back to the one who made the move
  state.currentPlayer = getNextPlayer(state.currentPlayer);

  if (move.from === null) {
    // Revert Placement
    state.piecesCount[state.currentPlayer]--;
    state.board[move.to] = null;
  } else {
    // Revert Movement
    state.board[move.to] = null;
    state.board[move.from] = state.currentPlayer;
  }

  state.phase = prevPhase;
  state.winner = prevWinner;
}

/**
 * Evaluates the current game state for the given player.
 * A positive score indicates a favorable state for the player, while a negative score indicates a disadvantage.
 *
 * Scoring Weights:
 * - Win: +10,000
 * - Loss: -10,000
 * - Draw: 0
 * - Center Control (Index 8): +20 if owned, -20 if opponent owns
 * - 2-in-a-row Threat (Offensive): +50
 * - 2-in-a-row Threat (Defensive): -60 (Higher priority to block)
 */
function evaluate(state: GameState, player: Player): number {
  if (state.winner === player) return 10000;
  if (state.winner && state.winner !== 'DRAW') return -10000;
  if (state.winner === 'DRAW') return 0;

  let score = 0;
  // Center Control
  if (state.board[8] === player) score += 20;
  else if (state.board[8] && state.board[8] !== player) score -= 20;

  // 2-in-a-row threats
  for (const line of WINNING_LINES) {
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < line.length; i++) {
      const p = state.board[line[i]];
      if (p === player) {
        playerCount++;
      } else if (p === null) {
        emptyCount++;
      } else {
        opponentCount++;
      }
    }

    if (playerCount === 2 && emptyCount === 1) score += 50; // Winning opportunity
    else if (opponentCount === 2 && emptyCount === 1) score -= 60; // Defensive priority
  }

  return score;
}

export function getBestMove(state: GameState, difficulty: Difficulty): { from: number | null, to: number } | null {
  const possibleMoves = getPossibleMoves(state);
  if (possibleMoves.length === 0) return null;

  // PLEBEIAN: 50% chance of random move
  if (difficulty === 'PLEBEIAN' && Math.random() < 0.5) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // Define depth based on difficulty
  let depth = 1;
  switch (difficulty) {
    case 'PLEBEIAN':
    case 'MERCHANT':
      depth = 1;
      break;
    case 'EQUES':
      depth = 2;
      break;
    case 'SENATOR':
      depth = 3;
      break;
    case 'CONSUL':
      depth = 4;
      break;
  }

  let bestMove = possibleMoves[0];
  let maxEval = -Infinity;

  // Randomize moves to avoid deterministic behavior on same scores
  possibleMoves.sort(() => Math.random() - 0.5);

  // Use a mutable copy for the minimax search to avoid mutating the original state
  const mutableState: GameState = {
    ...state,
    board: [...state.board],
    piecesCount: { ...state.piecesCount },
  };

  for (const move of possibleMoves) {
    const { prevPhase, prevWinner } = makeMove(mutableState, move);
    const evalValue = minimax(mutableState, depth - 1, -Infinity, Infinity, false, state.currentPlayer);
    undoMove(mutableState, move, prevPhase, prevWinner);

    if (evalValue > maxEval) {
      maxEval = evalValue;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiPlayer: Player): number {
  if (state.winner || depth === 0) {
    return evaluate(state, aiPlayer);
  }

  const possibleMoves = getPossibleMoves(state);

  if (possibleMoves.length === 0) {
    // If blocked and cannot move, it's typically a loss in Rota variations or just pass.
    // Assuming loss if stuck in movement phase.
    if (state.phase === 'MOVEMENT') {
        return isMaximizing ? -10000 : 10000;
    }
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of possibleMoves) {
      const { prevPhase, prevWinner } = makeMove(state, move);
      const evalValue = minimax(state, depth - 1, alpha, beta, false, aiPlayer);
      undoMove(state, move, prevPhase, prevWinner);
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of possibleMoves) {
      const { prevPhase, prevWinner } = makeMove(state, move);
      const evalValue = minimax(state, depth - 1, alpha, beta, true, aiPlayer);
      undoMove(state, move, prevPhase, prevWinner);
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
