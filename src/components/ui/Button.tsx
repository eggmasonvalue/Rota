'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'glass';
}

export function Button({ children, className, variant = 'glass', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-colors duration-300 backdrop-blur-md border cursor-pointer select-none";

  const variants = {
    // Primary: Solid brand color (e.g., Red) with matching glow
    primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_var(--color-primary)] hover:shadow-[0_0_25px_var(--color-primary)] border-transparent",

    // Secondary: Solid secondary color (e.g., Blue) with matching glow
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_15px_var(--color-secondary)] hover:shadow-[0_0_25px_var(--color-secondary)] border-transparent",

    // Glass: Transparent/Subtle for UI controls. Uses theme-aware glass variables.
    glass: "bg-[var(--glass-bg)] text-foreground hover:bg-[var(--glass-border)]/20 hover:border-[var(--glass-border)] shadow-sm border-[var(--glass-border)]",
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
