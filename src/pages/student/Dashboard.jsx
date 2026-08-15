import { useState, useEffect } from "react";
import { Trophy, Users, Clock, CheckCircle2, Vote, Loader2, Plus, LogOut } from "lucide-react";
import { getCategories } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import PhaseCountdown from "../../components/ui/PhaseCountdown";
import NominationModal from "../../components/student/NominationModal";
import VotingModal from "../../components/student/VotingModal";

function StatusPill({ cat, hasNominated, hasVoted }) {
  if (cat.nomination_is_open && !hasNominated) {
    return <span className="badge-pending">Nominate Now</span>;
  }
  if (hasNominated && !cat.voting_is_open) {
    return <span className="badge-success"><CheckCircle2 size={11} /> Nominated</span>;
  }
  if (cat.voting_is_open && !hasVoted) {
    return <span className="badge-pending">Vote Now</span>;
  }
  if (hasVoted) {
    return <span className="badge-success"><CheckCircle2 size={11} /> Voted</span>;
  }
  return <span className="badge-rejected text-slate-400 border-slate-700 bg-transparent">Closed</span>;
}

function CategoryCard({ cat, onNominate, onVote }) {
  const isAward = cat.type === "award";

  const handleClick = () => {
    if (cat.nomination_is_open) onNominate(cat);
    else if (cat.voting_is_open) onVote(cat);
  };

  const isActionable = cat.nomination_is_open || cat.voting_is_open;

  return (
    <div
      id={`cat-${cat.id}`}
      onClick={isActionable ? handleClick : undefined}
      className={`glass-card p-5 flex flex-col gap-4 transition-all duration-300 ${
        isActionable ? "cursor-pointer glass-card-hover" : "opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isAward
                ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))"
                : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
            }}
          >
            {isAward ? (
              <Trophy size={18} className="text-gold-400" />
            ) : (
              <Users size={18} className="text-indigo-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{cat.name}</h3>
          </div>
        </div>
        <span className={isAward ? "badge-award" : "badge-position"}>
          {isAward ? "🏆 Award" : "👤 Position"}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <StatusPill cat={cat} hasNominated={false} hasVoted={false} />
      </div>

      {/* Countdown */}
      {cat.nomination_is_open && cat.nomination_close_at && (
        <PhaseCountdown targetDate={cat.nomination_close_at} label="Nominations close" />
      )}
      {cat.voting_is_open && cat.voting_close_at && (
        <PhaseCountdown targetDate={cat.voting_close_at} label="Voting closes" />
      )}

      {/* CTA */}
      {isActionable && (
        <button className={cat.nomination_is_open ? "btn-primary text-xs py-2" : "btn-gold text-xs py-2"}>
          {cat.nomination_is_open ? (
            <><Plus size={14} /> Nominate</>
          ) : (
            <><Vote size={14} /> Cast Vote</>
          )}
        </button>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nominateTarget, setNominateTarget] = useState(null);
  const [voteTarget, setVoteTarget] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const nomOpen = categories.filter((c) => c.nomination_is_open).length;
  const voteOpen = categories.filter((c) => c.voting_is_open).length;

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-indigo-400" />
            <span className="font-display text-white font-semibold">UNILAG Premed</span>
          </div>
          <button onClick={logout} className="btn-ghost text-xs gap-1.5">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-1">
            Welcome back 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Select a category below to nominate or vote.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Categories", value: categories.length, icon: <Trophy size={16} className="text-gold-400" /> },
            { label: "Nominations Open", value: nomOpen, icon: <Plus size={16} className="text-indigo-400" /> },
            { label: "Voting Open", value: voteOpen, icon: <Vote size={16} className="text-teal-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 size={24} className="animate-spin mr-2" />
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>No categories are active yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <div key={cat.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
                <CategoryCard
                  cat={cat}
                  onNominate={setNominateTarget}
                  onVote={setVoteTarget}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {nominateTarget && (
        <NominationModal
          category={nominateTarget}
          onClose={() => setNominateTarget(null)}
          onSuccess={() => { setNominateTarget(null); fetchCategories(); }}
        />
      )}
      {voteTarget && (
        <VotingModal
          category={voteTarget}
          onClose={() => setVoteTarget(null)}
          onSuccess={() => { setVoteTarget(null); fetchCategories(); }}
        />
      )}
    </div>
  );
}
