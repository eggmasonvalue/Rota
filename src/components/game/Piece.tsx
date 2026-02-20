'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/game-logic';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
}

export function Piece({ player, isSelected }: PieceProps) {
  const color = player === 'PLAYER' ? 'bg-primary' : 'bg-secondary';
  const shadow = player === 'PLAYER'
    ? 'shadow-[0_0_15px_rgba(0,240,255,0.8)]'
    : 'shadow-[0_0_15px_rgba(255,0,255,0.8)]';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: isSelected ? 1.2 : 1,
        boxShadow: isSelected
          ? player === 'PLAYER' ? '0 0 30px rgba(0,240,255,1)' : '0 0 30px rgba(255,0,255,1)'
          : player === 'PLAYER' ? '0 0 15px rgba(0,240,255,0.8)' : '0 0 15px rgba(255,0,255,0.8)'
      }}
      className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${color} ${shadow}`}
    />
  );
}
