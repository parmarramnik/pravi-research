import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@infrasphere.local');
  const [password, setPassword] = useState('Infrasphere@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials or unauthorized access.');
    }
  };

  const handleDemoSelect = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Infrasphere@2026');
    setLoading(true);
    const success = await login(demoEmail, 'Infrasphere@2026');
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#1e293b]">
          <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            IS
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">INFRASPHERE</h1>
            <p className="text-xs text-slate-400">Unified Infrastructure Asset Lifecycle & Intelligence</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 text-sm font-mono uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* 1-Click Demo Personas */}
        <div className="mt-6 pt-4 border-t border-[#1e293b]">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Demo Sign-In (1-Click)</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleDemoSelect('admin@infrasphere.local')}
              className="text-left px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs flex justify-between items-center"
            >
              <span className="text-white font-medium">Administrator</span>
              <span className="text-[10px] text-indigo-400 font-mono">admin@infrasphere.local</span>
            </button>
            <button
              onClick={() => handleDemoSelect('asset.manager@infrasphere.local')}
              className="text-left px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs flex justify-between items-center"
            >
              <span className="text-white font-medium">Asset Manager</span>
              <span className="text-[10px] text-sky-400 font-mono">asset.manager@infrasphere.local</span>
            </button>
            <button
              onClick={() => handleDemoSelect('inspector@infrasphere.local')}
              className="text-left px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs flex justify-between items-center"
            >
              <span className="text-white font-medium">Field Inspector</span>
              <span className="text-[10px] text-amber-400 font-mono">inspector@infrasphere.local</span>
            </button>
            <button
              onClick={() => handleDemoSelect('maintenance@infrasphere.local')}
              className="text-left px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs flex justify-between items-center"
            >
              <span className="text-white font-medium">Maintenance Manager</span>
              <span className="text-[10px] text-emerald-400 font-mono">maintenance@infrasphere.local</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
