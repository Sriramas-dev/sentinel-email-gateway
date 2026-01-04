import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, emailsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/emails?limit=10`),
      ]);
      setStats(statsRes.data);
      setRecentEmails(emailsRes.data.emails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyan-400 font-mono">LOADING DASHBOARD...</div>
      </div>
    );
  }

  const chartData = recentEmails.slice(0, 7).reverse().map((email, idx) => ({
    name: `T-${6 - idx}`,
    threats: email.status === 'QUARANTINE' ? 1 : 0,
    clean: email.status === 'CLEAN' ? 1 : 0,
  }));

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Threat Overview
        </h1>
        <p className="font-body text-slate-400 mt-2">Real-time email security monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Scanned"
          value={stats?.emails?.total || 0}
          icon={Activity}
          variant="default"
          testId="stat-total-scanned"
        />
        <StatCard
          title="Clean Emails"
          value={stats?.emails?.clean || 0}
          icon={CheckCircle}
          variant="clean"
          testId="stat-clean-emails"
        />
        <StatCard
          title="Suspicious"
          value={stats?.emails?.suspicious || 0}
          icon={AlertTriangle}
          variant="suspicious"
          testId="stat-suspicious"
        />
        <StatCard
          title="Quarantined"
          value={stats?.emails?.quarantine || 0}
          icon={Shield}
          variant="malicious"
          testId="stat-quarantined"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Threat Activity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="#7f1d1d" />
              <Area type="monotone" dataKey="clean" stackId="1" stroke="#06b6d4" fill="#083344" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Recent Scans
          </h2>
          <div className="space-y-3">
            {recentEmails.slice(0, 5).map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-sm border border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-slate-300 truncate">{email.subject}</p>
                  <p className="font-mono text-xs text-slate-500 mt-1">{email.sender}</p>
                </div>
                <div className="ml-4">
                  {email.status === 'CLEAN' && (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded-sm border border-cyan-900/50">
                      <CheckCircle size={14} /> CLEAN
                    </span>
                  )}
                  {email.status === 'SUSPICIOUS' && (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-400 bg-amber-950/30 px-2 py-1 rounded-sm border border-amber-900/50">
                      <AlertTriangle size={14} /> SUSPICIOUS
                    </span>
                  )}
                  {email.status === 'QUARANTINE' && (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-red-400 bg-red-950/30 px-2 py-1 rounded-sm border border-red-900/50">
                      <Shield size={14} /> QUARANTINE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
        <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
          Model Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2">Accuracy</p>
            <p className="font-mono text-2xl text-cyan-400">
              {((stats?.model?.accuracy || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2">Version</p>
            <p className="font-mono text-2xl text-cyan-400">v{stats?.model?.version || 1}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-2">
              Training Samples
            </p>
            <p className="font-mono text-2xl text-cyan-400">{stats?.model?.training_samples || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;