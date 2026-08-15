import { useState, useEffect } from 'react';
import { Users, Trophy, BarChart2, Settings, Upload, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getIdentityStats, getCategories } from '../../api/client';
import type { IdentityStats } from '../../types';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: number | null | undefined;
  icon: ReactNode;
  color: string;
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20', border: `1px solid ${color}30` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

interface NavLink {
  label: string;
  href: string;
  icon: ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Categories', href: '/admin/categories', icon: <Settings size={16} /> },
  { label: 'Nominees', href: '/admin/nominees', icon: <Trophy size={16} /> },
  { label: 'Results', href: '/admin/results', icon: <BarChart2 size={16} /> },
  { label: 'Seed Voters', href: '/admin/seed', icon: <Upload size={16} /> },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<IdentityStats | null>(null);
  const [catCount, setCatCount] = useState<number | null>(null);

  useEffect(() => {
    getIdentityStats().then((r) => setStats(r.data)).catch(() => {});
    getCategories().then((r) => setCatCount(r.data.length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-indigo-400" />
            <span className="font-display text-white font-semibold">Admin Panel</span>
            <span className="badge-position text-xs ml-1">UNILAG Premed</span>
          </div>
          <button onClick={() => void logout()} className="btn-ghost text-xs gap-1.5">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage categories, nominees, and view results.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <KpiCard label="Eligible Voters" value={stats?.total_eligible} icon={<Users size={20} />} color="#6366f1" />
          <KpiCard label="Have Nominated" value={stats?.total_nominated} icon={<Trophy size={20} />} color="#fbbf24" />
          <KpiCard label="Have Voted" value={stats?.total_voted} icon={<BarChart2 size={20} />} color="#14b8a6" />
          <KpiCard label="Categories" value={catCount} icon={<Settings size={20} />} color="#8b5cf6" />
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_LINKS.map(({ label, href, icon }) => (
            <button
              key={href}
              id={`admin-nav-${label.toLowerCase().replace(' ', '-')}`}
              onClick={() => void navigate(href)}
              className="glass-card-hover p-5 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                  {icon}
                </div>
                <span className="font-medium text-white text-sm">{label}</span>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
