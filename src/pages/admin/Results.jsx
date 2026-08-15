import { useState, useEffect, useRef } from "react";
import { ArrowLeft, BarChart2, Download, Trophy, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllResults, exportResultsCsv } from "../../api/client";
import NomineeAvatar from "../../components/ui/NomineeAvatar";

function ResultBar({ entry, maxVotes }) {
  const pct = maxVotes > 0 ? (entry.vote_count / maxVotes) * 100 : 0;
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    setTimeout(() => { el.style.width = pct + "%"; }, 100);
  }, [pct]);

  return (
    <div className="flex items-center gap-3">
      <NomineeAvatar name={entry.nominee_name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium truncate ${entry.is_winner ? "text-gold-400" : "text-white"}`}>
            {entry.nominee_name}
            {entry.is_winner && " 🏆"}
          </span>
          <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{entry.vote_count} votes</span>
        </div>
        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className={`h-full rounded-full transition-all duration-700 ease-out ${entry.is_winner ? "result-bar-winner" : "result-bar"}`}
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getAllResults()
      .then((r) => setResults(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportResultsCsv();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "premed_results.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="btn-ghost p-1.5"><ArrowLeft size={16} /></button>
            <span className="font-display text-white font-semibold">Results</span>
          </div>
          <button onClick={handleExport} disabled={exporting} className="btn-primary text-xs">
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Export CSV
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-xl text-white">Aggregated Results</h1>
          <p className="text-slate-400 text-sm mt-1">Vote counts per nominee per category. No voter identity is ever shown.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading results…
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No results yet.</p>
        ) : (
          <div className="space-y-6">
            {results.map((cat, ci) => {
              const maxVotes = Math.max(...(cat.results.map((r) => r.vote_count)), 1);
              return (
                <div key={cat.category_id} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${ci * 80}ms` }}>
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart2 size={18} className="text-indigo-400" />
                    <h2 className="font-semibold text-white">{cat.category_name}</h2>
                    <span className={cat.category_type === "award" ? "badge-award" : "badge-position"}>
                      {cat.category_type === "award" ? "🏆 Award" : "👤 Position"}
                    </span>
                  </div>
                  {cat.results.length === 0 ? (
                    <p className="text-slate-500 text-sm">No votes recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {cat.results
                        .sort((a, b) => b.vote_count - a.vote_count)
                        .map((entry) => (
                          <ResultBar key={entry.ballot_entry_id} entry={entry} maxVotes={maxVotes} />
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
