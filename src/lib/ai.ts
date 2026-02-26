import { GameState, Player, getPossibleMoves, checkWin, getNextPlayer, WINNING_LINES, Difficulty } from './game-logic';

// Helper to simulate a move without mutating the original state
function applyMove(state: GameState, move: { from: number | null, to: number }): GameState {
  const newBoard = [...state.board];
  const newPiecesCount = { ...state.piecesCount };
  let newPhase = state.phase;

  if (move.from === null) {
    // Placement
    newBoard[move.to] = state.currentPlayer;
    newPiecesCount[state.currentPlayer]++;

    // Check if placement phase ends
    // If both players have placed 3 pieces, switch to MOVEMENT
    if (newPiecesCount.PLAYER1 === 3 && newPiecesCount.PLAYER2 === 3) {
      newPhase = 'MOVEMENT';
    }
  } else {
    // Movement
    newBoard[move.from] = null;
    newBoard[move.to] = state.currentPlayer;
  }

  const winner = checkWin(newBoard);

  return {
    ...state,
    board: newBoard,
    currentPlayer: getNextPlayer(state.currentPlayer),
    phase: winner ? 'GAME_OVER' : newPhase,
    winner: winner,
    piecesCount: newPiecesCount,
    history: [...state.history, JSON.stringify(newBoard)]
  };
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
    const pieces = line.map(i => state.board[i]);
    const playerCount = pieces.filter(p => p === player).length;
    const opponentCount = pieces.filter(p => p && p !== player).length;
    const emptyCount = pieces.filter(p => p === null).length;

    if (playerCount === 2 && emptyCount === 1) score += 50; // Winning opportunity
    if (opponentCount === 2 && emptyCount === 1) score -= 60; // Defensive priority
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
    case 'EQUITES':
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

  for (const move of possibleMoves) {
    const nextState = applyMove(state, move);
    const evalValue = minimax(nextState, depth - 1, -Infinity, Infinity, false, state.currentPlayer);

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
      const nextState = applyMove(state, move);
      const evalValue = minimax(nextState, depth - 1, alpha, beta, false, aiPlayer);
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of possibleMoves) {
      const nextState = applyMove(state, move);
      const evalValue = minimax(nextState, depth - 1, alpha, beta, true, aiPlayer);
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
