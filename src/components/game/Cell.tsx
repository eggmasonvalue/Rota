'use client';

import { motion } from 'framer-motion';
import { Piece } from './Piece';
import { Player } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

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
      className={cn(
        "absolute flex items-center justify-center cursor-pointer touch-manipulation",
        "-translate-x-1/2 -translate-y-1/2",
        "w-[60px] h-[60px]",
        isSource ? "z-20" : "z-10"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Hitbox/Background for the cell point - ALWAYS consistent */}
      <div className={cn(
        "w-4 h-4 rounded-full transition-all duration-300",
        "bg-[var(--background)] border-2 border-[var(--glass-border)]",
        // Only apply a subtle hover effect if not a valid move (valid moves have the ring)
        !isValidMove && "hover:border-[var(--foreground)]"
      )} />

      {/* Hint for valid move destination (pulsing ring) - separated from node styling */}
      {isValidMove && !player && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-[var(--glass-border)] opacity-60"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{
            rotate: { duration: 8, ease: "linear", repeat: Infinity },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
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
