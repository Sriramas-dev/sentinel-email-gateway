import React from 'react';

const StatCard = ({ title, value, icon: Icon, variant = 'default', testId }) => {
  const variants = {
    default: 'border-slate-800 bg-slate-950/40',
    clean: 'border-cyan-900/50 bg-cyan-950/20',
    suspicious: 'border-amber-900/50 bg-amber-950/20',
    malicious: 'border-red-900/50 bg-red-950/20',
  };

  const iconColors = {
    default: 'text-slate-400',
    clean: 'text-cyan-400',
    suspicious: 'text-amber-400',
    malicious: 'text-red-400',
  };

  return (
    <div
      data-testid={testId}
      className={`rounded-sm border backdrop-blur-sm p-6 ${variants[variant]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
            {title}
          </p>
          <p className="font-heading font-bold text-3xl text-slate-100">{value}</p>
        </div>
        {Icon && <Icon size={40} className={iconColors[variant]} />}
      </div>
    </div>
  );
};

export default StatCard;