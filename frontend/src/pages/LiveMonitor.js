import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TerminalWindow from '../components/TerminalWindow';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LiveMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const loadRecentLogs = async () => {
    try {
      const response = await axios.get(`${API}/emails?limit=5`);
      const allLogs = [];

      for (const email of response.data.emails) {
        if (email.sandbox_score) {
          const emailDetail = await axios.get(`${API}/emails/${email.id}`);
          if (emailDetail.data.sandbox_logs.length > 0) {
            allLogs.push(...emailDetail.data.sandbox_logs.flatMap((log) => log.trace));
          }
        }
      }

      setLogs(allLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  return (
    <div className="p-8" data-testid="live-monitor-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Live Monitor
        </h1>
        <p className="font-body text-slate-400 mt-2">Real-time sandbox execution traces</p>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-xl text-slate-100 uppercase">
            Execution Traces
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="font-mono text-xs text-slate-400">
              {isStreaming ? 'STREAMING' : 'MONITORING'}
            </span>
          </div>
        </div>

        <TerminalWindow title="SANDBOX MONITOR" logs={logs} height="600px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">Total Events</p>
          <p className="font-mono text-3xl text-cyan-400">{logs.length}</p>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">Alerts</p>
          <p className="font-mono text-3xl text-amber-400">
            {logs.filter((log) => log.action === 'ALERT' || log.action === 'CRITICAL').length}
          </p>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">Network Events</p>
          <p className="font-mono text-3xl text-purple-400">
            {logs.filter((log) => log.action === 'NETWORK').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;