import { useEffect, useState } from 'react';
import { projectsApi, clientsApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Plus, X, Wrench, Eye as WindowIcon, Sun, User, ChevronRight, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const COLUMNS = [
  { id: 'new_inquiry', label: 'Nová poptávka', color: 'border-gray-400', bg: 'bg-gray-50' },
  { id: 'site_visit', label: 'Obhlídka', color: 'border-blue-400', bg: 'bg-blue-50/30' },
  { id: 'pricing', label: 'Nacenění', color: 'border-yellow-400', bg: 'bg-yellow-50/30' },
  { id: 'waiting_material', label: 'Čeká na materiál', color: 'border-orange-400', bg: 'bg-orange-50/30' },
  { id: 'in_progress', label: 'K montáži', color: 'border-indigo-500', bg: 'bg-indigo-50/30' },
  { id: 'done', label: 'Hotovo', color: 'border-green-500', bg: 'bg-green-50/30' },
  { id: 'invoiced', label: 'Vyfakturováno', color: 'border-emerald-500', bg: 'bg-emerald-50/30' },
];

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  garage_doors: { label: 'Vrata', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
  windows: { label: 'Okna', icon: WindowIcon, color: 'text-green-600', bg: 'bg-green-50' },
  shading: { label: 'Stínění', icon: Sun, color: 'text-purple-600', bg: 'bg-purple-50' },
};

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export default function KanbanPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [filterType, setFilterType] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const load = () => {
    Promise.all([
      projectsApi.list(filterType ? { type: filterType } : undefined),
      hasPermission('users:read') ? usersApi.list().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([p, u]) => { setProjects(p.data); setUsers(u.data); })
      .catch(() => toast.error('Chyba načítání'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterType]);

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault(); setDragOverCol(null);
    if (!draggedId) return;
    if (projects.find(p => p.id === draggedId)?.status === newStatus) { setDraggedId(null); return; }
    setProjects(prev => prev.map(p => p.id === draggedId ? { ...p, status: newStatus } : p));
    try { await projectsApi.update(draggedId, { status: newStatus }); toast.success(`→ ${COLUMNS.find(c => c.id === newStatus)?.label}`); }
    catch { toast.error('Chyba'); load(); }
    setDraggedId(null);
  };

  const quickAssign = async (projectId: string, field: string, userId: string) => {
    try {
      await projectsApi.update(projectId, { [field]: userId });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [field]: userId } : p));
      toast.success('Přiřazeno');
    } catch { toast.error('Chyba'); }
  };

  const filtered = projects.filter(p => {
    if (!searchQ) return true;
    return p.title?.toLowerCase().includes(searchQ.toLowerCase());
  });

  const getUserInitials = (uid?: string) => {
    if (!uid) return null;
    const u = users.find(u => u.id === uid);
    return u ? `${u.firstName[0]}${u.lastName[0]}` : null;
  };
  const getUserName = (uid?: string) => {
    if (!uid) return 'Nepřiřazeno';
    const u = users.find(u => u.id === uid);
    return u ? `${u.firstName} ${u.lastName}` : '';
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Realizace</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input !py-1.5 !pl-8 text-sm w-[180px]" placeholder="Hledat..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[{ key: '', label: 'Vše' }, { key: 'garage_doors', label: 'Vrata' }, { key: 'windows', label: 'Okna' }, { key: 'shading', label: 'Stínění' }].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === f.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                {f.label}
              </button>
            ))}
          </div>
          {(hasPermission('projects:write') || hasPermission('projects:create')) && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm !py-1.5">
              <Plus size={15} /> Nová zakázka
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
        {COLUMNS.map(col => {
          const colProjects = filtered.filter(p => p.status === col.id);
          return (
            <div key={col.id}
              className={`min-w-[260px] max-w-[300px] flex-shrink-0 rounded-xl p-2.5 transition-all ${col.bg} ${dragOverCol === col.id ? 'ring-2 ring-brand-gold/30' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}>
              <div className={`flex items-center justify-between mb-2.5 pb-2 border-b-2 ${col.color}`}>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{col.label}</h3>
                <span className="text-[10px] bg-white/80 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">{colProjects.length}</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {colProjects.map(project => {
                  const tc = TYPE_CONFIG[project.type] || TYPE_CONFIG.garage_doors;
                  const TypeIcon = tc.icon;
                  const techInitials = getUserInitials(project.assignedTechnicianId);
                  const salesInitials = getUserInitials(project.assignedSalesId);
                  return (
                    <div key={project.id} draggable onDragStart={e => handleDragStart(e, project.id)}
                      className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100/80 cursor-pointer hover:shadow-md hover:border-brand-gold/30 transition-all active:scale-[0.98] ${draggedId === project.id ? 'opacity-40 scale-95' : ''}`}>
                      <div onClick={() => navigate(`/projects/${project.id}`)}>
                        <div className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                            <TypeIcon size={13} className={tc.color} />
                          </div>
                          <p className="font-medium text-[13px] text-gray-900 leading-tight flex-1 line-clamp-2">{project.title}</p>
                        </div>
                        {project.totalPrice && (
                          <p className="text-xs font-semibold text-gray-600 mt-2">{formatCZK(project.totalPrice)}</p>
                        )}
                      </div>
                      {/* Assignees - clickable */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                        <div className="flex -space-x-1">
                          {salesInitials && (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600 ring-2 ring-white" title={`Obchodník: ${getUserName(project.assignedSalesId)}`}>
                              {salesInitials}
                            </div>
                          )}
                          {techInitials && (
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[9px] font-bold text-orange-600 ring-2 ring-white" title={`Technik: ${getUserName(project.assignedTechnicianId)}`}>
                              {techInitials}
                            </div>
                          )}
                          {!salesInitials && !techInitials && (
                            <span className="text-[10px] text-gray-400">nepřiřazeno</span>
                          )}
                        </div>
                        {project.deadline && (
                          <span className="text-[10px] text-gray-400">{new Date(project.deadline).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <QuickProjectForm
          users={users}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); toast.success('Zakázka vytvořena'); }}
        />
      )}
    </div>
  );
}

// ===== SIMPLIFIED PROJECT FORM - everything on one screen, 3 clicks to create =====
function QuickProjectForm({ users, onClose, onSaved, defaultClientId }: {
  users: any[]; onClose: () => void; onSaved: () => void; defaultClientId?: string;
}) {
  const toast = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [step, setStep] = useState(1); // 1 = basics, done
  const [form, setForm] = useState({
    title: '', type: 'garage_doors' as string, clientId: defaultClientId || '',
    assignedSalesId: '', assignedTechnicianId: '',
    totalPrice: '', deadline: '', description: '', status: 'new_inquiry',
  });
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => { clientsApi.list().then(r => setClients(r.data)).catch(() => {}); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const clientName = (c: any) => c.type === 'company' ? c.companyName : `${c.firstName} ${c.lastName}`;

  const salesUsers = users.filter(u => ['root', 'admin', 'team_leader', 'sales_rep'].includes(u.role));
  const techUsers = users.filter(u => u.role === 'technician');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.clientId) { toast.warning('Vyplňte název a klienta'); return; }
    setSaving(true);
    try {
      await projectsApi.create({
        ...form,
        totalPrice: form.totalPrice ? Number(form.totalPrice) : undefined,
        deadline: form.deadline || undefined,
        currency: 'CZK',
      });
      onSaved();
    } catch (err: any) { toast.error(err.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Nová zakázka</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. Typ - velké tlačítka */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Typ služby</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={key} type="button" onClick={() => set('type', key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.type === key ? 'border-brand-gold bg-brand-gold/5 text-brand-gold' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    <Icon size={20} />
                    <span className="text-xs">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Název */}
          <input className="input text-base" placeholder="Název zakázky *" required value={form.title}
            onChange={e => set('title', e.target.value)} autoFocus />

          {/* 3. Klient */}
          <select className="input" required value={form.clientId} onChange={e => set('clientId', e.target.value)}>
            <option value="">Vyberte klienta *</option>
            {clients.map(c => <option key={c.id} value={c.id}>{clientName(c)}</option>)}
          </select>

          {/* 4. Přiřazení - obchodník + technik */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Obchodník</label>
              <select className="input text-sm" value={form.assignedSalesId} onChange={e => set('assignedSalesId', e.target.value)}>
                <option value="">— vybrat —</option>
                {salesUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Technik</label>
              <select className="input text-sm" value={form.assignedTechnicianId} onChange={e => set('assignedTechnicianId', e.target.value)}>
                <option value="">— vybrat —</option>
                {techUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>

          {/* Rozbalit více polí */}
          {!showMore ? (
            <button type="button" onClick={() => setShowMore(true)} className="text-sm text-brand-gold hover:text-brand-gold-dark font-medium">
              + Cena, termín, popis...
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Cena (CZK)</label>
                  <input type="number" className="input text-sm" placeholder="0" value={form.totalPrice} onChange={e => set('totalPrice', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Termín</label>
                  <input type="date" className="input text-sm" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
              </div>
              <textarea className="input min-h-[60px] text-sm" placeholder="Popis zakázky..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Ukládám...' : 'Vytvořit zakázku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
