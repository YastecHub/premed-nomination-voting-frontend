import { Shield, X } from 'lucide-react';
import { useState } from 'react';

interface PrivacyModalProps {
  onClose: () => void;
}

function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-teal-400" />
            <h3 className="font-semibold text-white">How Your Anonymity Is Protected</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p>This portal uses a strict <strong className="text-white">identity/content separation</strong> to protect your privacy:</p>

          <div className="glass-card p-4 space-y-3">
            <div className="flex gap-3">
              <span className="text-teal-400 font-mono text-xs mt-0.5">1</span>
              <div>
                <p className="text-white font-medium mb-1">Your matric number is never stored</p>
                <p className="text-slate-400 text-xs">It's hashed with SHA-256 + a server secret before being saved. Even a full database dump reveals nothing.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-teal-400 font-mono text-xs mt-0.5">2</span>
              <div>
                <p className="text-white font-medium mb-1">Nominations and votes have no submitter field</p>
                <p className="text-slate-400 text-xs">The database record for your submission contains zero reference to your identity — not even an anonymized ID.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-teal-400 font-mono text-xs mt-0.5">3</span>
              <div>
                <p className="text-white font-medium mb-1">Admins see only vote counts, never who voted</p>
                <p className="text-slate-400 text-xs">The admin results page runs a count-only aggregation query. Raw vote records are never shown to anyone.</p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-xs">
            <strong className="text-slate-300">Honest limitation:</strong> This provides strong practical unlinkability, not formal cryptographic anonymity. A system administrator with OS-level server access could theoretically correlate access logs. For an internal department tool run by trusted staff, this is an appropriate tradeoff.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyBadge() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="privacy-badge hover:border-teal-500/40 transition-colors cursor-pointer"
      >
        <Shield size={12} />
        Your identity is never stored with this submission
      </button>
      {open && <PrivacyModal onClose={() => setOpen(false)} />}
    </>
  );
}
