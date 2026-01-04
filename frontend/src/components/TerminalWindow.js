import React, { useEffect, useRef } from 'react';

const TerminalWindow = ({ logs = [], title = 'TERMINAL', height = '400px' }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="border border-slate-800 bg-black rounded-sm overflow-hidden">
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">{title}</span>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-cyan-500/60"></div>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="font-mono text-sm p-4 overflow-y-auto custom-scrollbar"
        style={{ height }}
      >
        {logs.length === 0 ? (
          <div className="text-slate-600">Waiting for activity...</div>
        ) : (
          logs.map((log, index) => {
            const colors = {
              INIT: 'text-slate-400',
              PARSE: 'text-blue-400',
              URL_DETECT: 'text-purple-400',
              ALERT: 'text-amber-400',
              INDICATOR: 'text-orange-400',
              CRITICAL: 'text-red-400',
              SCRIPT: 'text-red-400',
              ANALYZE: 'text-cyan-400',
              NETWORK: 'text-purple-400',
              COMPLETE: 'text-green-400',
            };

            const color = colors[log.action] || 'text-slate-300';

            return (
              <div key={index} className="mb-1">
                <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`ml-2 ${color}`}>[{log.action}]</span>
                <span className="ml-2 text-slate-300">{log.detail}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TerminalWindow;