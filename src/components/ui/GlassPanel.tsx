import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn(
      "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6",
      className
    )}>
      {children}
    </div>
  );
}
