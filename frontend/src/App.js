import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EmailScanner from './pages/EmailScanner';
import LiveMonitor from './pages/LiveMonitor';
import Quarantine from './pages/Quarantine';
import Analytics from './pages/Analytics';
import Configuration from './pages/Configuration';
import Training from './pages/Training';
import { Toaster } from 'sonner';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<EmailScanner />} />
            <Route path="/monitor" element={<LiveMonitor />} />
            <Route path="/quarantine" element={<Quarantine />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/config" element={<Configuration />} />
            <Route path="/training" element={<Training />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;