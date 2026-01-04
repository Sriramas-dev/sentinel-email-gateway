import React from 'react';

const ScoreBadge = ({ score, size = 'md' }) => {
  let variant = 'clean';
  let label = 'CLEAN';
  
  if (score >= 0.85) {
    variant = 'malicious';
    label = 'MALICIOUS';
  } else if (score >= 0.5) {
    variant = 'suspicious';
    label = 'SUSPICIOUS';
  }

  const variants = {
    clean: 'bg-cyan-950/30 text-cyan-400 border-cyan-900/50',
    suspicious: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    malicious: 'bg-red-950/30 text-red-400 border-red-900/50',
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 font-mono uppercase tracking-wider border rounded-sm ${
        variants[variant]
      } ${sizes[size]}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'clean'
              ? 'bg-cyan-400'
              : variant === 'suspicious'
              ? 'bg-amber-400'
              : 'bg-red-400'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'clean'
              ? 'bg-cyan-500'
              : variant === 'suspicious'
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
        ></span>
      </span>
      {label} ({(score * 100).toFixed(1)}%)
    </span>
  );
};

export default ScoreBadge;