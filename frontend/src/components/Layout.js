import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Terminal, Lock, BarChart3, Settings, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Activity, label: 'Dashboard' },
  { path: '/scanner', icon: Shield, label: 'Email Scanner' },
  { path: '/monitor', icon: Terminal, label: 'Live Monitor' },
  { path: '/quarantine', icon: Lock, label: 'Quarantine' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/config', icon: Settings, label: 'Config' },
  { path: '/training', icon: GraduationCap, label: 'Training' },
];

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <div className="p-6 border-b border-slate-800">
          <h1 className="font-heading font-bold text-2xl text-cyan-400 tracking-tight uppercase">
            S.E.N.T.I.N.E.L.
          </h1>
          <p className="font-mono text-xs text-slate-500 mt-1">SECURE EMAIL GATEWAY</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm font-mono text-sm uppercase tracking-wider
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900/50 border border-transparent'
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-sm p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-xs text-slate-400">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;