import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const Configuration = () => {
  const [config, setConfig] = useState({
    mlThreshold: 0.5,
    sandboxThreshold: 0.85,
    autoQuarantine: true,
    enableSandbox: true,
    logRetention: 30,
  });

  const handleSave = () => {
    toast.success('Configuration saved successfully');
  };

  return (
    <div className="p-8" data-testid="configuration-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Configuration
        </h1>
        <p className="font-body text-slate-400 mt-2">System settings and threshold tuning</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Detection Thresholds
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-sm uppercase tracking-widest text-slate-300">
                  ML Clean Threshold
                </label>
                <span className="font-mono text-cyan-400">{config.mlThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.mlThreshold}
                onChange={(e) => setConfig({ ...config, mlThreshold: parseFloat(e.target.value) })}
                data-testid="threshold-ml-clean"
                className="w-full h-2 bg-slate-800 rounded-sm appearance-none cursor-pointer"
              />
              <p className="font-mono text-xs text-slate-500 mt-2">
                Emails with scores below this threshold are marked as CLEAN
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-sm uppercase tracking-widest text-slate-300">
                  Auto-Quarantine Threshold
                </label>
                <span className="font-mono text-red-400">{config.sandboxThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.sandboxThreshold}
                onChange={(e) =>
                  setConfig({ ...config, sandboxThreshold: parseFloat(e.target.value) })
                }
                data-testid="threshold-quarantine"
                className="w-full h-2 bg-slate-800 rounded-sm appearance-none cursor-pointer"
              />
              <p className="font-mono text-xs text-slate-500 mt-2">
                Emails with scores above this threshold are automatically quarantined
              </p>
            </div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            System Features
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-sm border border-slate-800">
              <div>
                <p className="font-mono text-sm text-slate-300 uppercase tracking-wider">
                  Auto-Quarantine
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  Automatically quarantine high-risk emails
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoQuarantine}
                  onChange={(e) => setConfig({ ...config, autoQuarantine: e.target.checked })}
                  data-testid="toggle-auto-quarantine"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-sm border border-slate-800">
              <div>
                <p className="font-mono text-sm text-slate-300 uppercase tracking-wider">
                  Sandbox Analysis
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  Enable behavioral detonation for suspicious emails
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableSandbox}
                  onChange={(e) => setConfig({ ...config, enableSandbox: e.target.checked })}
                  data-testid="toggle-sandbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Data Management
          </h2>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-sm uppercase tracking-widest text-slate-300">
                Log Retention (Days)
              </label>
              <span className="font-mono text-cyan-400">{config.logRetention}</span>
            </div>
            <input
              type="range"
              min="7"
              max="90"
              step="1"
              value={config.logRetention}
              onChange={(e) => setConfig({ ...config, logRetention: parseInt(e.target.value) })}
              data-testid="slider-log-retention"
              className="w-full h-2 bg-slate-800 rounded-sm appearance-none cursor-pointer"
            />
            <p className="font-mono text-xs text-slate-500 mt-2">
              Number of days to retain email logs and sandbox traces
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          data-testid="button-save-config"
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase tracking-wider text-sm rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)] transition-all py-3 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          SAVE CONFIGURATION
        </button>
      </div>
    </div>
  );
};

export default Configuration;