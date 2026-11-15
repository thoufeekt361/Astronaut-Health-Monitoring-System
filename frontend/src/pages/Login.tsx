import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radio, Eye, EyeOff, ShieldCheck, Lock, Mail, Orbit, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('operator@cosmic.nasa.gov');
  const [password, setPassword] = useState<string>('CosmicSix2026!');
  const [name, setName] = useState<string>('Flight Director Vance');
  const [role, setRole] = useState<string>('Mission Operator');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      const ok = await register(name, email, password, role);
      if (ok) navigate('/dashboard');
    } else {
      const ok = await login(email, password);
      if (ok) navigate('/dashboard');
    }
  };

  const handleQuickFill = (roleName: string, roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('CosmicSix2026!');
    setRole(roleName);
  };

  return (
    <div className="min-h-screen bg-[#07111F] flex items-center justify-center p-4 relative overflow-hidden radar-grid">
      {/* Decorative cosmic glow orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-glow-primary mb-4">
            <Orbit className="w-9 h-9 text-white animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">COSMIC SIX</h1>
          <p className="text-xs font-mono text-sky-400 mt-1 uppercase tracking-widest">
            ASTRONAUT HEALTH MONITORING & INTELLIGENT PREDICTION
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
            NASA Space Apps Challenge 2026
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>{isRegisterMode ? 'New Mission Operator' : 'Mission Control Access'}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              {isRegisterMode ? 'Already authorized? Log in' : 'Create new credential'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name & Title</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
                    placeholder="e.g. Dr. Alex Mercer"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Mission Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-xs"
                  placeholder="operator@cosmic.nasa.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Role Classification</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="Mission Operator">Mission Operator</option>
                  <option value="Medical Officer">Medical Officer</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-glow-primary transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Radio className="w-4 h-4 animate-spin text-white" />
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Clearance</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick presets for evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Instant Clearance Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('Mission Operator', 'operator@cosmic.nasa.gov')}
                className="py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 font-mono text-center hover:border-sky-500 transition-colors"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Medical Officer', 'medic@cosmic.nasa.gov')}
                className="py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 font-mono text-center hover:border-emerald-500 transition-colors"
              >
                Flight Surgeon
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Admin', 'admin@cosmic.nasa.gov')}
                className="py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 font-mono text-center hover:border-purple-500 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer footer */}
        <p className="text-[10px] text-slate-500 text-center mt-6 max-w-sm mx-auto leading-relaxed">
          Synthetic Telemetry Simulation Prototype. Designed for research & demonstration in the NASA Space Apps Challenge 2026.
        </p>
      </div>
    </div>
  );
};
