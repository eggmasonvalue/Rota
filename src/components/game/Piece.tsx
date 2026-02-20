'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/game-logic';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
}

export function Piece({ player, isSelected }: PieceProps) {
  // Use CSS variables for colors
  const bgColor = player === 'PLAYER' ? 'bg-primary' : 'bg-secondary';

  // Dynamic shadow values based on theme variables (using CSS vars in style or Tailwind classes)
  // PLAYER = Tyrian Purple, CPU = Imperial Gold
  const shadowColor = player === 'PLAYER'
    ? 'rgba(102, 2, 60, 0.6)'
    : 'rgba(212, 175, 55, 0.6)';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: isSelected ? 1.2 : 1,
        boxShadow: isSelected
          ? `0 0 30px ${shadowColor}`
          : `0 0 15px ${shadowColor}`,
        border: '1px solid rgba(255,255,255,0.2)'
      }}
      className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${bgColor}`}
    />
  );
}
