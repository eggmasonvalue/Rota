'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/game-logic';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
}

export function Piece({ player, isSelected }: PieceProps) {
  // Use CSS variables for colors (The Forum theme)
  const bgColor = player === 'PLAYER1' ? 'bg-primary' : 'bg-secondary';

  // Dynamic shadow values based on theme variables
  const shadowColor = player === 'PLAYER1'
    ? 'var(--color-primary)'
    : 'var(--color-secondary)';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: isSelected ? 1.2 : 1,
        boxShadow: isSelected
          ? `0 0 20px 4px ${shadowColor}`
          : `0 0 10px 1px ${shadowColor}`,
        // Use a subtle border based on foreground or glass border for contrast
        border: '1px solid var(--glass-border)'
      }}
      className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${bgColor} opacity-90`}
    />
  );
}
