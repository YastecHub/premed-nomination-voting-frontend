import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/client';
import type { Category } from '../../types';

interface CategoryFormValues {
  name: string;
  type: 'award' | 'position';
  nomination_open_at: string;
  nomination_close_at: string;
  voting_open_at: string;
  voting_close_at: string;
  nomination_force_closed: boolean;
  voting_force_closed: boolean;
}

interface CategoryFormProps {
  initial?: Partial<Category>;
  onSave: (form: CategoryFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}

function CategoryForm({ initial = {}, onSave, onCancel, saving }: CategoryFormProps) {
  const [form, setForm] = useState<CategoryFormValues>({
    name: initial.name ?? '',
    type: initial.type ?? 'award',
    nomination_open_at: initial.nomination_open_at ? initial.nomination_open_at.slice(0, 16) : '',
    nomination_close_at: initial.nomination_close_at ? initial.nomination_close_at.slice(0, 16) : '',
    voting_open_at: initial.voting_open_at ? initial.voting_open_at.slice(0, 16) : '',
    voting_close_at: initial.voting_close_at ? initial.voting_close_at.slice(0, 16) : '',
    nomination_force_closed: initial.nomination_force_closed ?? false,
    voting_force_closed: initial.voting_force_closed ?? false,
  });

  const set = <K extends keyof CategoryFormValues>(k: K, v: CategoryFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Category Name *</label>
          <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Best Mentor" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Type *</label>
          <select className="input-field" value={form.type} onChange={(e) => set('type', e.target.value as 'award' | 'position')}>
            <option value="award">🏆 Award</option>
            <option value="position">👤 Position</option>
          </select>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">Nomination Phase</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Opens</label>
          <input type="datetime-local" className="input-field" value={form.nomination_open_at} onChange={(e) => set('nomination_open_at', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Closes</label>
          <input type="datetime-local" className="input-field" value={form.nomination_close_at} onChange={(e) => set('nomination_close_at', e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.nomination_force_closed} onChange={(e) => set('nomination_force_closed', e.target.checked)} className="rounded" />
        <span className="text-xs text-slate-400">Force-close nominations immediately</span>
      </label>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">Voting Phase</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Opens</label>
          <input type="datetime-local" className="input-field" value={form.voting_open_at} onChange={(e) => set('voting_open_at', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Closes</label>
          <input type="datetime-local" className="input-field" value={form.voting_close_at} onChange={(e) => set('voting_close_at', e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.voting_force_closed} onChange={(e) => set('voting_force_closed', e.target.checked)} className="rounded" />
        <span className="text-xs text-slate-400">Force-close voting immediately</span>
      </label>

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || saving} className="btn-primary flex-1">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </div>
  );
}

function toIso(val: string): string | null {
  return val ? new Date(val).toISOString() : null;
}

export default function CategoriesAdmin() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCats = () => {
    setLoading(true);
    getCategories().then((r) => setCategories(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchCats, []);

  const handleCreate = async (form: CategoryFormValues) => {
    setSaving(true);
    try {
      await createCategory({
        ...form,
        nomination_open_at: toIso(form.nomination_open_at),
        nomination_close_at: toIso(form.nomination_close_at),
        voting_open_at: toIso(form.voting_open_at),
        voting_close_at: toIso(form.voting_close_at),
      });
      setCreating(false);
      fetchCats();
    } finally { setSaving(false); }
  };

  const handleUpdate = async (form: CategoryFormValues) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateCategory(editing.id, {
        ...form,
        nomination_open_at: toIso(form.nomination_open_at),
        nomination_close_at: toIso(form.nomination_close_at),
        voting_open_at: toIso(form.voting_open_at),
        voting_close_at: toIso(form.voting_close_at),
      });
      setEditing(null);
      fetchCats();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone if no nominations exist.')) return;
    await deleteCategory(id).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Cannot delete';
      alert(msg);
    });
    fetchCats();
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => void navigate('/admin')} className="btn-ghost p-1.5"><ArrowLeft size={16} /></button>
          <span className="font-display text-white font-semibold">Categories</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl text-white">Manage Categories</h1>
          <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary">
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className="glass-card p-6 mb-6 animate-slide-up">
            <h3 className="text-sm font-semibold text-white mb-4">Create New Category</h3>
            <CategoryForm onSave={(f) => void handleCreate(f)} onCancel={() => setCreating(false)} saving={saving} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card p-5">
                {editing?.id === cat.id ? (
                  <CategoryForm initial={cat} onSave={(f) => void handleUpdate(f)} onCancel={() => setEditing(null)} saving={saving} />
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cat.type === 'award' ? 'badge-award' : 'badge-position'}>
                        {cat.type === 'award' ? '🏆 Award' : '👤 Position'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{cat.name}</p>
                        <div className="flex gap-2 mt-1">
                          {cat.nomination_is_open && <span className="badge-success text-xs">Nominations Open</span>}
                          {cat.voting_is_open && <span className="badge-pending text-xs">Voting Open</span>}
                          {cat.ballot_published && <span className="badge-position text-xs">Ballot Published</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setEditing(cat)} className="btn-ghost p-2"><Pencil size={14} /></button>
                      <button onClick={() => void handleDelete(cat.id)} className="btn-danger p-2"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-slate-500 py-10">No categories yet. Create one above.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
