import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ScoreBadge from '../components/ScoreBadge';
import TerminalWindow from '../components/TerminalWindow';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmailScanner = () => {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    sender: '',
    recipient: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/email/analyze`, formData);
      setResult(response.data);
      toast.success('Email analysis complete!');
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast.error('Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" data-testid="email-scanner-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-slate-100 uppercase tracking-tight">
          Email Scanner
        </h1>
        <p className="font-body text-slate-400 mt-2">Analyze email content for phishing threats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
          <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
            Email Input
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-500 block mb-2">
                Sender Email
              </label>
              <input
                type="email"
                required
                data-testid="input-sender"
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 font-mono rounded-sm px-4 py-2 placeholder:text-slate-600"
                placeholder="sender@example.com"
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-500 block mb-2">
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                data-testid="input-recipient"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 font-mono rounded-sm px-4 py-2 placeholder:text-slate-600"
                placeholder="recipient@example.com"
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-500 block mb-2">
                Subject Line
              </label>
              <input
                type="text"
                required
                data-testid="input-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 font-mono rounded-sm px-4 py-2 placeholder:text-slate-600"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-500 block mb-2">
                Email Body
              </label>
              <textarea
                required
                rows={8}
                data-testid="input-body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 font-mono rounded-sm px-4 py-2 placeholder:text-slate-600 resize-none"
                placeholder="Paste email content here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-analyze"
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-mono uppercase tracking-wider text-sm rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)] transition-all py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Send size={18} />
                  ANALYZE EMAIL
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {result && (
            <>
              <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6">
                <h2 className="font-heading font-semibold text-xl text-slate-100 mb-4 uppercase">
                  Analysis Results
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                      ML Phishing Score
                    </p>
                    <ScoreBadge score={result.ml_score} size="lg" />
                  </div>

                  {result.sandbox_score !== null && (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                        Sandbox Behavioral Score
                      </p>
                      <ScoreBadge score={result.sandbox_score} size="lg" />
                    </div>
                  )}

                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                      Final Decision
                    </p>
                    <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-800">
                      <p className="font-mono text-lg text-slate-100">
                        Status: <span className="text-cyan-400">{result.status}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-2">
                      Email ID
                    </p>
                    <p className="font-mono text-sm text-slate-400 break-all">{result.email_id}</p>
                  </div>
                </div>
              </div>

              {result.sandbox_result && (
                <TerminalWindow
                  title="SANDBOX EXECUTION TRACE"
                  logs={result.sandbox_result.traces}
                  height="400px"
                />
              )}
            </>
          )}

          {!result && (
            <div className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm rounded-sm p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-slate-600 text-sm">AWAITING EMAIL INPUT</p>
                <p className="font-mono text-slate-700 text-xs mt-2">Results will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailScanner;