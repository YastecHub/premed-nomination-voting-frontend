import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import { loginStudent, loginAdmin } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { CSSProperties } from 'react';
import axios from 'axios';

type LoginTab = 'student' | 'admin';

interface ParticleStyle extends CSSProperties {
  width: string;
  height: string;
  top: string;
  left: string;
  animationDelay: string;
  animationDuration: string;
  opacity: number;
}

function Particle({ style }: { style: ParticleStyle }) {
  return <div className="particle" style={style} />;
}

const PARTICLES: ParticleStyle[] = Array.from({ length: 12 }, () => ({
  width: `${Math.random() * 120 + 40}px`,
  height: `${Math.random() * 120 + 40}px`,
  top: `${Math.random() * 90}%`,
  left: `${Math.random() * 90}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${Math.random() * 4 + 5}s`,
  opacity: Math.random() * 0.15 + 0.05,
}));

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<LoginTab>('student');
  const [matric, setMatric] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matric.trim()) return;
    setError('');
    setLoading(true);

    try {
      if (tab === 'student') {
        const res = await loginStudent(matric);
        setUser({ role: res.data.role });
        void navigate('/dashboard');
      } else {
        if (!pin.trim()) { setError('PIN is required'); setLoading(false); return; }
        const res = await loginAdmin(matric, pin);
        setUser({ role: res.data.role });
        void navigate('/admin');
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string })?.detail ?? 'Invalid credentials'
        : 'Invalid credentials';
      setError(msg);
      setAttempts((a) => a + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <Particle key={i} style={p} />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo / Brand */}
        <div className="text-center mb-10 animate-fade-in">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-white mb-1">UNILAG Premed</h1>
          <p className="text-slate-400 text-sm">Nomination &amp; Voting Portal</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-scale-in">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-navy-900/60 p-1 mb-6">
            <button
              onClick={() => { setTab('student'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => { setTab('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {/* Matric field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                {tab === 'admin' ? 'Admin Matric Number' : 'Matric Number'}
              </label>
              <input
                id="matric-input"
                type="text"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                placeholder={tab === 'admin' ? 'e.g. ADM/19/0001' : 'e.g. 19/MED01/001'}
                className="input-field"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* PIN field (admin only) */}
            {tab === 'admin' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-medium text-slate-400 mb-2">Admin PIN</label>
                <div className="relative">
                  <input
                    id="pin-input"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="6-digit PIN"
                    className="input-field pr-10"
                    maxLength={10}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
                {attempts >= 3 && (
                  <p className="mt-1 text-rose-300/70">
                    Too many attempts may temporarily lock this IP.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading || !matric.trim()}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronRight size={16} />
              )}
              {loading ? 'Verifying…' : tab === 'admin' ? 'Sign in as Admin' : 'Enter Portal'}
            </button>
          </form>

          {/* Privacy note */}
          <p className="text-xs text-slate-500 text-center mt-5">
            🔒 Your matric number is never stored in plaintext.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          UNILAG Department of Premed Studies · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
