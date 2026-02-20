'use client';

import { GameState, getPossibleMoves } from '@/lib/game-logic';
import { Cell } from './Cell';

interface BoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
}

export function Board({ gameState, onCellClick }: BoardProps) {
  const RADIUS = 35; // percent
  const CENTER = 50; // percent

  const getPosition = (index: number) => {
    if (index === 8) return { x: CENTER, y: CENTER };
    const angleDeg = -90 + (index * 45);
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      x: CENTER + RADIUS * Math.cos(angleRad),
      y: CENTER + RADIUS * Math.sin(angleRad),
    };
  };

  const positions = Array.from({ length: 9 }, (_, i) => getPosition(i));

  const validDestinations = new Set<number>();
  if (gameState.phase === 'PLACEMENT') {
      gameState.board.forEach((p, i) => {
          if (p === null) validDestinations.add(i);
      });
  } else if (gameState.phase === 'MOVEMENT') {
      if (gameState.selectedCell !== null) {
           const moves = getPossibleMoves(gameState);
           moves.filter(m => m.from === gameState.selectedCell).forEach(m => validDestinations.add(m.to));
      }
  }

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto my-8">
      {/* SVG Board Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {positions.slice(0, 8).map((pos, i) => (
           <line key={i} x1="50" y1="50" x2={pos.x} y2={pos.y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Cells */}
      {positions.map((pos, i) => (
        <Cell
          key={i}
          index={i}
          player={gameState.board[i]}
          isValidMove={validDestinations.has(i)}
          isSource={gameState.selectedCell === i}
          onClick={() => onCellClick(i)}
          position={pos}
        />
      ))}
    </div>
  );
}
