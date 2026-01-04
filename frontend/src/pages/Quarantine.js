import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ScoreBadge from '../components/ScoreBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Quarantine = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuarantinedEmails();
  }, []);

  const fetchQuarantinedEmails = async () => {
    try {
      const response = await axios.get(`${API}/emails`);
      const quarantined = response.data.emails.filter((email) => email.status === 'QUARANTINE');
      setEmails(quarantined);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quarantined emails:', error);
      setLoading(false);
    }
  };

  const handleRelease = async (emailId) => {
    try {
      await axios.patch(`${API}/emails/${emailId}/status`, { status: 'CLEAN' });
      toast.success('Email released from quarantine');
      fetchQuarantinedEmails();
    } catch (error) {
      console.error('Error releasing email:', error);
      toast.error('Failed to release email');
    }
  };

  const handleDelete = async (emailId) => {
    try {
      await axios.patch(`${API}/emails/${emailId}/status`, { status: 'DELETED' });
      toast.success('Email permanently deleted');
      fetchQuarantinedEmails();
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to delete email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyan-400 font-mono">LOADING QUARANTINE...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="quarantine-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Quarantine Vault
        </h1>
        <p className="font-body text-slate-400 mt-2">
          Manage blocked emails - {emails.length} item(s) in quarantine
        </p>
      </div>

      {emails.length === 0 ? (
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-12 text-center">
          <Shield size={64} className="mx-auto text-slate-700 mb-4" />
          <p className="font-mono text-slate-500 text-lg">NO THREATS IN QUARANTINE</p>
          <p className="font-mono text-slate-600 text-sm mt-2">All systems secure</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="border border-red-900/50 bg-red-950/20 backdrop-blur-sm rounded-sm p-6"
              data-testid="quarantine-item"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className="text-red-400 flex-shrink-0" />
                    <h3 className="font-mono text-lg text-slate-100 truncate">{email.subject}</h3>
                  </div>
                  <p className="font-mono text-sm text-slate-400">From: {email.sender}</p>
                  <p className="font-mono text-xs text-slate-500 mt-1">
                    {new Date(email.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleRelease(email.id)}
                    data-testid="button-release"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase tracking-wider text-xs rounded-sm px-4 py-2 flex items-center gap-2 transition-all"
                  >
                    <CheckCircle size={16} />
                    RELEASE
                  </button>
                  <button
                    onClick={() => handleDelete(email.id)}
                    data-testid="button-delete"
                    className="bg-red-600 hover:bg-red-500 text-white font-mono uppercase tracking-wider text-xs rounded-sm px-4 py-2 flex items-center gap-2 transition-all"
                  >
                    <Trash2 size={16} />
                    DELETE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                    ML Phishing Score
                  </p>
                  <ScoreBadge score={email.ml_score} />
                </div>
                {email.sandbox_score && (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                      Sandbox Score
                    </p>
                    <ScoreBadge score={email.sandbox_score} />
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                  Email Body Preview
                </p>
                <p className="font-mono text-sm text-slate-300">
                  {email.body.substring(0, 200)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quarantine;