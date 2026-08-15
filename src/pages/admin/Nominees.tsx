import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check, X, Merge, BookCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCategories,
  listNominations,
  updateNominationStatus,
  mergeNominations,
  publishBallot,
} from '../../api/client';
import type { Category, Nomination, DuplicateHint } from '../../types';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';

interface NomCardProps {
  nom: Nomination;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isDuplicate: boolean;
}

function NomCard({ nom, onApprove, onReject, isDuplicate }: NomCardProps) {
  return (
    <div className={`glass-card p-4 ${isDuplicate ? 'border-gold-500/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">{nom.nominee_name}</p>
            {isDuplicate && <span className="badge-pending text-xs">Possible Duplicate</span>}
          </div>
          {nom.reason && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{nom.reason}</p>}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onApprove(nom.id)} className="btn-success p-1.5 text-xs" title="Approve Nominee"><Check size={13} /></button>
          <button onClick={() => onReject(nom.id)} className="btn-danger p-1.5 text-xs" title="Reject Nominee"><X size={13} /></button>
        </div>
      </div>
    </div>
  );
}

interface MergeModalProps {
  duplicates: DuplicateHint[];
  onClose: () => void;
  onMerge: (keepId: string, discardId: string, finalName: string) => Promise<void>;
}

function MergeModal({ duplicates, onClose, onMerge }: MergeModalProps) {
  const [keepId] = useState(duplicates[0]?.nomination_a_id ?? '');
  const [discardId] = useState(duplicates[0]?.nomination_b_id ?? '');
  const [finalName, setFinalName] = useState(duplicates[0]?.name_a ?? '');
  const [saving, setSaving] = useState(false);

  const handleMerge = async () => {
    setSaving(true);
    try { await onMerge(keepId, discardId, finalName); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Merge size={16} className="text-gold-400" /> Merge Duplicates</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          {duplicates.slice(0, 3).map((d, i) => (
            <div key={i} className="glass-card p-3 text-xs text-slate-300">
              <span className="text-gold-400 font-semibold">{d.name_a}</span>
              {' '}vs{' '}
              <span className="text-indigo-400 font-semibold">{d.name_b}</span>
              <span className="text-slate-500 ml-2">({d.similarity_score}% similar)</span>
            </div>
          ))}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Final Nominee Name</label>
            <input className="input-field" value={finalName} onChange={(e) => setFinalName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => void handleMerge()} disabled={saving || !finalName.trim()} className="btn-gold flex-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Merge size={14} />}
              Merge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KanbanColumn {
  label: string;
  noms: Nomination[];
  color: string;
}

export default function NomineesAdmin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateHint[]>([]);
  const [loading, setLoading] = useState(false);
  const [mergeModal, setMergeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { getCategories().then((r) => setCategories(r.data)); }, []);

  const fetchNoms = async (cat: Category) => {
    setSelectedCat(cat);
    setLoading(true);
    try {
      const res = await listNominations(cat.id);
      setNominations(res.data.nominations);
      setDuplicates(res.data.duplicate_hints);
    } finally { setLoading(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateNominationStatus(id, status);
      toast.success(`Nomination status updated to ${status}.`);
      if (selectedCat) void fetchNoms(selectedCat);
    } catch {
      toast.error('Failed to update nomination status.');
    }
  };

  const handleMerge = async (keepId: string, discardId: string, finalName: string) => {
    try {
      await mergeNominations({ keep_id: keepId, discard_id: discardId, final_name: finalName });
      toast.success(`Nominees merged into "${finalName}".`);
      if (selectedCat) void fetchNoms(selectedCat);
    } catch {
      toast.error('Failed to merge nominations.');
    }
  };

  const executePublish = async () => {
    if (!selectedCat) return;
    setPublishing(true);
    try {
      await publishBallot(selectedCat.id);
      toast.success(`Ballot published for "${selectedCat.name}"!`);
      setShowPublishModal(false);
      const res = await getCategories();
      setCategories(res.data);
      const updated = res.data.find((c) => c.id === selectedCat.id);
      if (updated) setSelectedCat(updated);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string })?.detail ?? 'Failed to publish ballot'
        : 'Failed to publish ballot';
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const pending = nominations.filter((n) => n.status === 'pending');
  const approved = nominations.filter((n) => n.status === 'approved');
  const rejected = nominations.filter((n) => n.status === 'rejected');

  const pendingDuplicateIds = new Set(
    duplicates.flatMap((d) => [d.nomination_a_id, d.nomination_b_id])
  );

  const columns: KanbanColumn[] = [
    { label: 'Pending', noms: pending, color: 'text-gold-400' },
    { label: 'Approved', noms: approved, color: 'text-teal-400' },
    { label: 'Rejected', noms: rejected, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => void navigate('/admin')} className="btn-ghost p-1.5"><ArrowLeft size={16} /></button>
          <span className="font-display text-white font-semibold">Nominees Review</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Category selector */}
        <div className="mb-6">
          <label className="block text-xs text-slate-400 mb-2">Select Category</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => void fetchNoms(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  selectedCat?.id === cat.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'glass-card border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {!selectedCat && (
          <p className="text-center text-slate-500 py-16">Select a category above to review its nominations.</p>
        )}

        {selectedCat && loading && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading nominations…
          </div>
        )}

        {selectedCat && !loading && (
          <div className="space-y-6">
            {/* Duplicate alert */}
            {duplicates.length > 0 && (
              <div className="glass-card p-4 border-gold-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gold-400 font-semibold text-sm">⚠ {duplicates.length} possible duplicate(s) detected</p>
                    <p className="text-slate-400 text-xs mt-0.5">Fuzzy name matching found similar nominations. Review and merge.</p>
                  </div>
                  <button onClick={() => setMergeModal(true)} className="btn-gold text-xs py-1.5">
                    <Merge size={13} /> Merge
                  </button>
                </div>
              </div>
            )}

            {/* Publish button */}
            {approved.length > 0 && !selectedCat.ballot_published && (
              <button onClick={() => setShowPublishModal(true)} className="btn-primary w-full sm:w-auto">
                <BookCheck size={14} />
                Publish Ballot ({approved.length} approved nominees)
              </button>
            )}
            {selectedCat.ballot_published && (
              <div className="badge-success inline-flex">✓ Ballot Published</div>
            )}

            {/* Kanban columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {columns.map(({ label, noms, color }) => (
                <div key={label} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className={`text-sm font-semibold ${color}`}>{label}</h3>
                    <span className="badge-position text-xs">{noms.length}</span>
                  </div>
                  <div className="space-y-2">
                    {noms.length === 0 && <p className="text-slate-600 text-xs">None</p>}
                    {noms.map((nom) => (
                      <NomCard
                        key={nom.id}
                        nom={nom}
                        isDuplicate={pendingDuplicateIds.has(nom.id)}
                        onApprove={(id) => void handleStatus(id, 'approved')}
                        onReject={(id) => void handleStatus(id, 'rejected')}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {mergeModal && (
        <MergeModal
          duplicates={duplicates}
          onClose={() => setMergeModal(false)}
          onMerge={handleMerge}
        />
      )}

      {/* Publish Ballot Modal */}
      <ConfirmModal
        isOpen={showPublishModal}
        title="Publish Voting Ballot"
        message={
          <>
            Are you sure you want to publish the ballot for <strong className="text-white">"{selectedCat?.name}"</strong> with <strong className="text-gold-400">{approved.length} approved nominee(s)</strong>?
            <br /><br />
            Once published, students will be able to vote and this action <strong className="text-white">cannot be undone</strong>.
          </>
        }
        confirmText="Yes, Publish Ballot"
        cancelText="Cancel"
        variant="warning"
        isLoading={publishing}
        onConfirm={() => void executePublish()}
        onCancel={() => {
          if (!publishing) setShowPublishModal(false);
        }}
      />
    </div>
  );
}
