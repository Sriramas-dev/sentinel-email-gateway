import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Training = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [modelStats, setModelStats] = useState(null);

  useEffect(() => {
    fetchEmails();
    fetchModelStats();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API}/emails?limit=20`);
      setEmails(response.data.emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchModelStats = async () => {
    try {
      const response = await axios.get(`${API}/model/stats`);
      setModelStats(response.data);
    } catch (error) {
      console.error('Error fetching model stats:', error);
    }
  };

  const handleFeedback = async (emailId, isPhishing) => {
    try {
      await axios.post(`${API}/feedback`, {
        email_id: emailId,
        is_phishing: isPhishing,
        admin_notes: '',
      });
      toast.success('Feedback submitted successfully');
      fetchEmails();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const response = await axios.post(`${API}/model/retrain`);
      setModelStats(response.data.stats);
      toast.success('Model retrained successfully');
    } catch (error) {
      console.error('Error retraining model:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to retrain model');
      }
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="p-8" data-testid="training-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Training Center
        </h1>
        <p className="font-body text-slate-400 mt-2">
          Submit feedback and retrain the ML model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
            Model Accuracy
          </p>
          <p className="font-mono text-3xl text-cyan-400">
            {((modelStats?.accuracy || 0) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
            Model Version
          </p>
          <p className="font-mono text-3xl text-cyan-400">v{modelStats?.version || 1}</p>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
            Training Samples
          </p>
          <p className="font-mono text-3xl text-cyan-400">{modelStats?.training_samples || 0}</p>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-xl text-slate-100 uppercase">
            Retrain Model
          </h2>
        </div>
        <p className="font-mono text-sm text-slate-400 mb-4">
          Retrain the ML model using admin feedback. Minimum 5 feedback samples required.
        </p>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          data-testid="button-retrain"
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-mono uppercase tracking-wider text-sm rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)] transition-all py-3 px-6 flex items-center gap-2"
        >
          <RefreshCw size={18} className={retraining ? 'animate-spin' : ''} />
          {retraining ? 'RETRAINING...' : 'RETRAIN MODEL'}
        </button>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
        <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
          Submit Feedback
        </h2>
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="p-4 bg-slate-900/50 rounded-sm border border-slate-800"
              data-testid="feedback-email"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-slate-300 truncate">{email.subject}</p>
                  <p className="font-mono text-xs text-slate-500 mt-1">From: {email.sender}</p>
                  <p className="font-mono text-xs text-slate-600 mt-1">
                    ML Score: {(email.ml_score * 100).toFixed(1)}% | Status: {email.status}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleFeedback(email.id, false)}
                    data-testid="button-mark-safe"
                    className="bg-cyan-950/30 hover:bg-cyan-950/50 text-cyan-400 border border-cyan-900/50 font-mono uppercase tracking-wider text-xs rounded-sm px-3 py-2 flex items-center gap-2 transition-all"
                  >
                    <CheckCircle size={16} />
                    SAFE
                  </button>
                  <button
                    onClick={() => handleFeedback(email.id, true)}
                    data-testid="button-mark-phishing"
                    className="bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/50 font-mono uppercase tracking-wider text-xs rounded-sm px-3 py-2 flex items-center gap-2 transition-all"
                  >
                    <XCircle size={16} />
                    PHISHING
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Training;