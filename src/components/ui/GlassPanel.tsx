import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn(
      "bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl shadow-xl p-6 transition-colors duration-500",
      className
    )}>
      {children}
    </div>
  );
}
