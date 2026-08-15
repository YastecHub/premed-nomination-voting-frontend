import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertTriangle } from "lucide-react";
import { getBallot, submitVote } from "../../api/client";
import NomineeAvatar from "../ui/NomineeAvatar";
import PrivacyBadge from "../ui/PrivacyBadge";
import confetti from "canvas-confetti";

export default function VotingModal({ category, onClose, onSuccess }) {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBallot(category.id)
      .then((res) => setEntries(res.data.entries))
      .catch(() => setError("Failed to load ballot."))
      .finally(() => setLoading(false));
  }, [category.id]);

  const handleVote = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitVote({ category_id: category.id, ballot_entry_id: selected });
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#fbbf24", "#f59e0b", "#6366f1", "#14b8a6"],
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Vote submission failed.");
      setSubmitting(false);
      setConfirm(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-white">{category.name}</h2>
            <p className="text-slate-500 text-xs">Select one nominee to vote for</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>

        {/* Entries list */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading ballot…
            </div>
          )}
          {!loading && entries.length === 0 && (
            <p className="text-center text-slate-500 py-8">No nominees on this ballot.</p>
          )}
          {entries.map((entry) => {
            const isSelected = selected === entry.id;
            return (
              <button
                key={entry.id}
                id={`ballot-entry-${entry.id}`}
                onClick={() => setSelected(entry.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "ballot-card-selected bg-gold-500/5"
                    : "glass-card hover:border-white/20"
                }`}
              >
                <NomineeAvatar name={entry.nominee_name} size="md" />
                <span className={`font-medium text-sm flex-1 ${isSelected ? "text-gold-400" : "text-white"}`}>
                  {entry.nominee_name}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "bg-gold-500 border-gold-500" : "border-white/20"
                }`}>
                  {isSelected && <Check size={12} className="text-navy-900" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 space-y-3 flex-shrink-0">
          <PrivacyBadge />

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {!confirm ? (
            <button
              id="confirm-vote-btn"
              onClick={() => setConfirm(true)}
              disabled={!selected}
              className="btn-gold w-full"
            >
              <Check size={16} /> Confirm Vote
            </button>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <div className="flex gap-2 items-start">
                <AlertTriangle size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  Once submitted, your vote <strong className="text-white">cannot be changed</strong>.
                  You are voting for:{" "}
                  <strong className="text-gold-400">
                    {entries.find((e) => e.id === selected)?.nominee_name}
                  </strong>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)} disabled={submitting} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button
                  id="final-vote-btn"
                  onClick={handleVote}
                  disabled={submitting}
                  className="btn-gold flex-1"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {submitting ? "Casting…" : "Yes, Cast My Vote"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
