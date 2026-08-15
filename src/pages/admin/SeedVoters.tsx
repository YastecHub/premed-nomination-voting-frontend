import { useState } from 'react';
import { ArrowLeft, Upload, Plus, Loader2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { seedFromCsv, seedManual } from '../../api/client';
import axios from 'axios';
import type { SeedResult } from '../../types';

type SeedTab = 'csv' | 'manual';

export default function SeedVoters() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SeedTab>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [manual, setManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState('');

  const handleCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await seedFromCsv(fd);
      setResult(res.data);
      setFile(null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string })?.detail ?? 'Upload failed'
        : 'Upload failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = manual.split(/[\n,]+/).map((m) => m.trim()).filter(Boolean);
    if (list.length === 0) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await seedManual(list);
      setResult(res.data);
      setManual('');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string })?.detail ?? 'Upload failed'
        : 'Upload failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  const triggerFileInput = () => {
    (document.getElementById('csv-file-input') as HTMLInputElement | null)?.click();
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => void navigate('/admin')} className="btn-ghost p-1.5"><ArrowLeft size={16} /></button>
          <span className="font-display text-white font-semibold">Seed Eligible Voters</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-xl text-white">Add Eligible Voters</h1>
          <p className="text-slate-400 text-sm mt-1">
            Matric numbers are hashed immediately and never stored in plaintext.
          </p>
        </div>

        {/* Tab */}
        <div className="flex rounded-xl bg-navy-900/60 p-1 mb-6 max-w-xs">
          <button
            onClick={() => setTab('csv')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Manual Entry
          </button>
        </div>

        <div className="glass-card p-6">
          {tab === 'csv' ? (
            <form onSubmit={(e) => void handleCsv(e)} className="space-y-4">
              <div
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500/40 transition-colors"
                onClick={triggerFileInput}
              >
                <Upload size={28} className="mx-auto mb-3 text-slate-500" />
                <p className="text-slate-400 text-sm">
                  {file ? file.name : 'Click to select CSV file'}
                </p>
                <p className="text-slate-600 text-xs mt-1">One matric number per row</p>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <button type="submit" disabled={!file || loading} className="btn-primary w-full">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {loading ? 'Uploading…' : 'Upload & Hash'}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => void handleManual(e)} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Matric Numbers (one per line or comma-separated)
                </label>
                <textarea
                  className="input-field resize-none h-40 font-mono text-xs"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder={'19/MED01/001\n19/MED01/002\n19/MED01/003'}
                />
              </div>
              <button type="submit" disabled={!manual.trim() || loading} className="btn-primary w-full">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {loading ? 'Processing…' : 'Add Voters'}
              </button>
            </form>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 glass-card p-4 border-teal-500/30 animate-slide-up">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm mb-2">
                <Check size={16} /> Done
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-white">{result.inserted}</p>
                  <p className="text-xs text-slate-500">Added</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-400">{result.skipped}</p>
                  <p className="text-xs text-slate-500">Already Existed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{result.total}</p>
                  <p className="text-xs text-slate-500">Total Processed</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <X size={13} className="inline mr-1" /> {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
