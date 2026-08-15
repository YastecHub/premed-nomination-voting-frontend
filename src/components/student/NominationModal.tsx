import { useState } from 'react';
import { X, Trophy, Users, Loader2, ChevronRight, Check } from 'lucide-react';
import { submitNomination } from '../../api/client';
import PrivacyBadge from '../ui/PrivacyBadge';
import confetti from 'canvas-confetti';
import type { Category } from '../../types';

interface NominationModalProps {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ['Nominee', 'Reason', 'Review'] as const;

export default function NominationModal({ category, onClose, onSuccess }: NominationModalProps) {
  const [step, setStep] = useState(0);
  const [nomineeName, setNomineeName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAward = category.type === 'award';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await submitNomination({
        category_id: category.id,
        nominee_name: nomineeName.trim(),
        reason: reason.trim() || undefined,
      });
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#fbbf24', '#14b8a6'],
      });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isAward ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)' }}
            >
              {isAward
                ? <Trophy size={16} className="text-gold-400" />
                : <Users size={16} className="text-indigo-400" />
              }
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{category.name}</h2>
              <p className="text-slate-500 text-xs">Submit a Nomination</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                i < step ? 'bg-indigo-600 text-white' :
                i === step ? 'border-2 border-indigo-500 text-indigo-400' :
                'border border-white/10 text-slate-600'
              }`}>
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 w-6 transition-all duration-300 ${i < step ? 'bg-indigo-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-slate-500">{STEPS[step]}</span>
        </div>

        {/* Step 0 — Nominee Name */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Nominee Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="nominee-name-input"
                type="text"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                placeholder="Full name (e.g. Dr. John Smith)"
                className="input-field"
                maxLength={120}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1.5">Self-nomination is allowed.</p>
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!nomineeName.trim() || nomineeName.trim().length < 2}
              className="btn-primary w-full"
            >
              Continue <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Step 1 — Reason */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Reason / Justification{' '}
                <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                id="reason-input"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 300))}
                placeholder="Why are you nominating this person? (max 300 characters)"
                className="input-field resize-none"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">{reason.length}/300</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Review <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Nominating</p>
                <p className="text-white font-semibold">{nomineeName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Category</p>
                <p className="text-slate-300 text-sm">{category.name}</p>
              </div>
              {reason && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Reason</p>
                  <p className="text-slate-300 text-sm">{reason}</p>
                </div>
              )}
            </div>

            <PrivacyBadge />

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} disabled={loading} className="btn-ghost flex-1">
                Back
              </button>
              <button
                id="submit-nomination-btn"
                onClick={() => void handleSubmit()}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {loading ? 'Submitting…' : 'Submit Anonymously'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
