import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'amber' | 'emerald' | 'zinc' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'rose',
  className = ''
}) => {
  const variants = {
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
