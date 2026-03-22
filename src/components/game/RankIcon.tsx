import React from 'react';

interface RankIconProps {
  className?: string;
  colorClass?: string;
  hubColorClass?: string;
}

export const RankIcon: React.FC<RankIconProps> = ({
  className = '',
  colorClass = 'text-current',
  hubColorClass,
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${colorClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Outer Circle */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />

      {/* Spokes */}
      <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="2" />
      <line x1="6.1005" y1="6.1005" x2="25.8995" y2="25.8995" stroke="currentColor" strokeWidth="2" />
      <line x1="6.1005" y1="25.8995" x2="25.8995" y2="6.1005" stroke="currentColor" strokeWidth="2" />

      {/* Decorative Dots on Rim */}
      <circle cx="16" cy="2" r="1.5" fill="currentColor" />
      <circle cx="16" cy="30" r="1.5" fill="currentColor" />
      <circle cx="2" cy="16" r="1.5" fill="currentColor" />
      <circle cx="30" cy="16" r="1.5" fill="currentColor" />
      <circle cx="6.1005" cy="6.1005" r="1.5" fill="currentColor" />
      <circle cx="25.8995" cy="25.8995" r="1.5" fill="currentColor" />
      <circle cx="6.1005" cy="25.8995" r="1.5" fill="currentColor" />
      <circle cx="25.8995" cy="6.1005" r="1.5" fill="currentColor" />

      {/* Center Hub */}
      <circle cx="16" cy="16" r="4" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" fill="currentColor" className={hubColorClass} />
    </svg>
  );
};
