'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assumes you created this based on previous step logic

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'glass';
}

export function Button({ children, className, variant = 'glass', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-colors duration-300 backdrop-blur-md border cursor-pointer";

  const variants = {
    primary: "bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] border-primary/30",
    secondary: "bg-secondary/20 text-secondary hover:bg-secondary/30 shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] border-secondary/30",
    glass: "bg-white/5 text-white hover:bg-white/10 hover:border-white/20 shadow-lg border-white/10",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
