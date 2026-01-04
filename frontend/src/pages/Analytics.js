import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = {
  clean: '#06b6d4',
  suspicious: '#f59e0b',
  quarantine: '#ef4444',
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, emailsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/emails?limit=50`),
      ]);
      setStats(statsRes.data);
      setEmails(emailsRes.data.emails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyan-400 font-mono">LOADING ANALYTICS...</div>
      </div>
    );
  }

  const pieData = [
    { name: 'Clean', value: stats?.emails?.clean || 0, color: COLORS.clean },
    { name: 'Suspicious', value: stats?.emails?.suspicious || 0, color: COLORS.suspicious },
    { name: 'Quarantine', value: stats?.emails?.quarantine || 0, color: COLORS.quarantine },
  ];

  const scoreDistribution = [
    { range: '0.0-0.3', count: emails.filter((e) => e.ml_score < 0.3).length },
    { range: '0.3-0.5', count: emails.filter((e) => e.ml_score >= 0.3 && e.ml_score < 0.5).length },
    { range: '0.5-0.7', count: emails.filter((e) => e.ml_score >= 0.5 && e.ml_score < 0.7).length },
    { range: '0.7-0.85', count: emails.filter((e) => e.ml_score >= 0.7 && e.ml_score < 0.85).length },
    { range: '0.85-1.0', count: emails.filter((e) => e.ml_score >= 0.85).length },
  ];

  return (
    <div className="p-8" data-testid="analytics-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Analytics
        </h1>
        <p className="font-body text-slate-400 mt-2">System performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Email Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            ML Score Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="range" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6 mb-6">
        <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
          Model Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">Accuracy</p>
            <p className="font-mono text-2xl text-cyan-400">
              {((stats?.model?.accuracy || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">Version</p>
            <p className="font-mono text-2xl text-cyan-400">v{stats?.model?.version || 1}</p>
          </div>
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
              Training Samples
            </p>
            <p className="font-mono text-2xl text-cyan-400">{stats?.model?.training_samples || 0}</p>
          </div>
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
              Last Trained
            </p>
            <p className="font-mono text-sm text-cyan-400">
              {stats?.model?.last_trained
                ? new Date(stats.model.last_trained).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
        <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
          Detection Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
              Total Scanned
            </p>
            <p className="font-mono text-3xl text-slate-100">{stats?.emails?.total || 0}</p>
          </div>
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
              Threat Detection Rate
            </p>
            <p className="font-mono text-3xl text-red-400">
              {stats?.emails?.total
                ? ((stats.emails.quarantine / stats.emails.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
              False Positive Rate
            </p>
            <p className="font-mono text-3xl text-amber-400">
              {stats?.emails?.total
                ? ((stats.emails.suspicious / stats.emails.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;