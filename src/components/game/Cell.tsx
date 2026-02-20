'use client';

import { motion } from 'framer-motion';
import { Piece } from './Piece';
import { Player } from '@/lib/game-logic';

interface CellProps {
  index: number;
  player: Player | null;
  isValidMove: boolean;
  isSource: boolean;
  onClick: () => void;
  position: { x: number, y: number };
}

export function Cell({ index, player, isValidMove, isSource, onClick, position }: CellProps) {
  return (
    <motion.div
      data-testid={`cell-${index}`}
      className="absolute flex items-center justify-center cursor-pointer touch-manipulation"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '60px',
        height: '60px',
        transform: 'translate(-50%, -50%)',
        zIndex: isSource ? 20 : 10
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Hitbox/Background for the cell point - using Imperial Gold for highlights */}
      <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
        isValidMove
          ? 'bg-secondary/50 shadow-[0_0_15px_rgba(212,175,55,0.8)] scale-150'
          : 'bg-white/10 hover:bg-white/20'
      }`} />

      {/* Hint for valid move destination (pulsing ring) - Gold color */}
      {isValidMove && !player && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/30"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 8, ease: "linear", repeat: Infinity },
            scale: { duration: 2, repeat: Infinity }
          }}
        />
      )}

      {/* Piece if present */}
      {player && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Piece player={player} isSelected={isSource} />
        </div>
      )}
    </motion.div>
  );
}
