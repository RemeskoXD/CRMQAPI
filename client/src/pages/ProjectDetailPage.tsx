import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsApi, tasksApi, usersApi } from '../services/api';
import NotesPanel from '../components/NotesPanel';
import PhotoGallery from '../components/PhotoGallery';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, MapPin, User, Wrench, FileText, Clock,
  CheckCircle2, Circle, Plus, X, Phone, Mail, Package,
  Eye as WindowIcon, Sun, Edit2, ChevronRight,
} from 'lucide-react';

const STATUS_FLOW = [
  { id: 'new_inquiry', label: 'Poptávka', short: 'Nová' },
  { id: 'site_visit', label: 'Obhlídka', short: 'Obhl.' },
  { id: 'pricing', label: 'Nacenění', short: 'Cena' },
  { id: 'waiting_material', label: 'Materiál', short: 'Mat.' },
  { id: 'in_progress', label: 'Montáž', short: 'Mont.' },
  { id: 'done', label: 'Hotovo', short: 'Hot.' },
  { id: 'invoiced', label: 'Fakt.', short: 'Fakt.' },
];

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  garage_doors: { label: 'Garážová vrata', icon: Wrench, color: 'text-blue-600 bg-blue-50' },
  windows: { label: 'Okna', icon: WindowIcon, color: 'text-green-600 bg-green-50' },
  shading: { label: 'Stínění', icon: Sun, color: 'text-purple-600 bg-purple-50' },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50', high: 'text-orange-600 bg-orange-50',
  medium: 'text-blue-600 bg-blue-50', low: 'text-gray-600 bg-gray-50',
};

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    Promise.all([
      projectsApi.get(id),
      hasPermission('users:read') ? usersApi.list().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([p, u]) => { setProject(p.data); setUsers(u.data); })
      .catch(() => toast.error('Chyba'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const updateField = async (field: string, value: any) => {
    try {
      await projectsApi.update(id!, { [field]: value });
      setProject((p: any) => ({ ...p, [field]: value }));
      setEditingField(null);
      toast.success('Uloženo');
    } catch { toast.error('Chyba'); }
  };

  const changeStatus = async (newStatus: string) => {
    await updateField('status', newStatus);
  };

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    try {
      await tasksApi.update(task.id, { status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : null });
      load();
    } catch { toast.error('Chyba'); }
  };

  const getUserName = (uid?: string) => {
    if (!uid) return null;
    const u = users.find(u => u.id === uid);
    return u ? `${u.firstName} ${u.lastName}` : null;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <p className="text-gray-500">Zakázka nenalezena.</p>;

  const tc = TYPE_CONFIG[project.type] || TYPE_CONFIG.garage_doors;
  const TypeIcon = tc.icon;
  const currentIdx = STATUS_FLOW.findIndex(s => s.id === project.status);
  const canEdit = hasPermission('projects:write');

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Link to="/kanban" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-gold transition-colors">
        <ArrowLeft size={15} /> Zpět
      </Link>

      {/* Header card */}
      <div className="card !p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.color}`}>
            <TypeIcon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge text-xs ${tc.color}`}>{tc.label}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
          </div>
          {project.totalPrice && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">Cena</p>
              <p className="text-2xl font-bold text-brand-gold">{formatCZK(project.totalPrice)}</p>
            </div>
          )}
        </div>

        {/* STATUS PIPELINE - klikatelná */}
        {canEdit && (
          <div className="mt-5 pt-4 border-t">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STATUS_FLOW.map((step, idx) => {
                const isActive = step.id === project.status;
                const isPast = idx < currentIdx;
                return (
                  <button
                    key={step.id}
                    onClick={() => changeStatus(step.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-gold text-brand-dark shadow-sm'
                        : isPast
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    {isPast && <CheckCircle2 size={12} />}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.short}</span>
                    {idx < STATUS_FLOW.length - 1 && <ChevronRight size={10} className="text-gray-300 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick info row */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t text-sm">
          {/* Klient - klikatelný */}
          {project.client && (
            <Link to={`/clients/${project.client.id}`} className="flex items-center gap-2 hover:text-brand-gold transition-colors">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-700 font-medium">{project.client.companyName || `${project.client.firstName} ${project.client.lastName}`}</span>
            </Link>
          )}
          {project.location && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(`${project.location.street}, ${project.location.city}`)}`}
              target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-gold transition-colors">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-gray-700">{project.location.street}, {project.location.city}</span>
            </a>
          )}
          {project.client?.phone && (
            <a href={`tel:${project.client.phone}`} className="flex items-center gap-2 hover:text-brand-gold transition-colors">
              <Phone size={14} className="text-gray-400" />
              <span className="text-gray-700">{project.client.phone}</span>
            </a>
          )}
          {project.deadline && (
            <span className="flex items-center gap-2 text-gray-600">
              <Clock size={14} className="text-gray-400" />
              Termín: {new Date(project.deadline).toLocaleDateString('cs-CZ')}
            </span>
          )}
        </div>

        {/* Assignees - editable inline */}
        <div className="flex gap-4 mt-3 pt-3 border-t">
          <AssigneeSelect label="Obchodník" value={project.assignedSalesId} users={users.filter(u => ['root','admin','team_leader','sales_rep'].includes(u.role))}
            onChange={val => updateField('assignedSalesId', val)} canEdit={canEdit} />
          <AssigneeSelect label="Technik" value={project.assignedTechnicianId} users={users.filter(u => u.role === 'technician')}
            onChange={val => updateField('assignedTechnicianId', val)} canEdit={canEdit} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks */}
        <div className="card !p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Úkoly ({(project.tasks || []).length})</h2>
            {hasPermission('tasks:write') && (
              <button onClick={() => setShowTaskForm(true)} className="text-brand-gold hover:text-brand-gold-dark text-xs font-semibold flex items-center gap-1">
                <Plus size={14} /> Přidat
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {(project.tasks || []).map((task: any) => (
              <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 ${task.status === 'done' ? 'opacity-50' : ''}`}>
                <button onClick={() => toggleTask(task)}
                  className={`flex-shrink-0 ${task.status === 'done' ? 'text-green-500' : 'text-gray-300 hover:text-brand-gold'} transition-colors`}>
                  {task.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                {task.dueDate && <span className="text-[10px] text-gray-400">{new Date(task.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}</span>}
                <span className={`badge text-[9px] ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
              </div>
            ))}
            {(!project.tasks || project.tasks.length === 0) && <p className="text-xs text-gray-400 text-center py-4">Žádné úkoly</p>}
          </div>
        </div>

        {/* Invoices */}
        <div className="card !p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Doklady ({(project.invoices || []).length})</h2>
          <div className="space-y-1.5">
            {(project.invoices || []).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.invoiceNumber}</p>
                  <p className="text-[10px] text-gray-400">{inv.type === 'quote' ? 'Nabídka' : inv.type === 'advance' ? 'Záloha' : 'Faktura'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCZK(inv.total)}</p>
                  <span className={`badge text-[9px] ${inv.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{inv.status}</span>
                </div>
              </div>
            ))}
            {(!project.invoices || project.invoices.length === 0) && <p className="text-xs text-gray-400 text-center py-4">Žádné doklady</p>}
          </div>
        </div>

        {/* Materials */}
        {(project.materials || []).length > 0 && (
          <div className="card !p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
              <Package size={14} className="text-brand-gold" /> Materiál
            </h2>
            <div className="space-y-1">
              {(project.materials || []).map((m: any) => (
                <div key={m.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{m.description}</span>
                  <span className="text-gray-500 font-medium">{m.quantity} {m.unit}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t text-sm font-bold">
                <span>Celkem</span>
                <span className="text-brand-gold">{formatCZK((project.materials || []).reduce((s: number, m: any) => s + m.totalPrice, 0))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile contact card */}
        {project.client && (
          <div className="card !p-4 lg:hidden">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Kontakt</h2>
            <div className="space-y-2">
              {project.client.phone && (
                <a href={`tel:${project.client.phone}`} className="flex items-center gap-2.5 p-3 bg-green-50 rounded-lg text-green-700 font-medium text-sm active:bg-green-100">
                  <Phone size={16} /> {project.client.phone}
                </a>
              )}
              {project.client.email && (
                <a href={`mailto:${project.client.email}`} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  <Mail size={14} className="text-gray-400" /> {project.client.email}
                </a>
              )}
              {project.location && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(`${project.location.street}, ${project.location.city}`)}`}
                  target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg text-blue-700 text-sm">
                  <MapPin size={14} /> {project.location.street}, {project.location.city}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {/* Photo gallery */}
      <PhotoGallery projectId={id!} canEdit={canEdit} />

      {/* Notes */}
      <NotesPanel entityType="project" entityId={id!} />

      {showTaskForm && (
        <QuickTaskModal projectId={id!}
          onClose={() => setShowTaskForm(false)}
          onSaved={() => { setShowTaskForm(false); load(); toast.success('Úkol přidán'); }} />
      )}
    </div>
  );
}

function AssigneeSelect({ label, value, users, onChange, canEdit }: {
  label: string; value?: string; users: any[]; onChange: (val: string) => void; canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = users.find(u => u.id === value);

  if (!canEdit) {
    return (
      <div className="text-sm">
        <span className="text-xs text-gray-500">{label}: </span>
        <span className="font-medium text-gray-700">{current ? `${current.firstName} ${current.lastName}` : '—'}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm hover:text-brand-gold transition-colors">
        {current ? (
          <>
            <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center text-[9px] font-bold text-brand-gold">
              {current.firstName[0]}{current.lastName[0]}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-xs font-medium text-gray-700">{current.firstName} {current.lastName}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={12} className="text-gray-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-xs text-gray-400">Přiřadit</p>
            </div>
          </>
        )}
        <Edit2 size={10} className="text-gray-300" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border py-1 min-w-[180px] z-40 animate-fade-in">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50">
              — Nepřiřazeno —
            </button>
            {users.map(u => (
              <button key={u.id} onClick={() => { onChange(u.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${u.id === value ? 'text-brand-gold font-medium' : 'text-gray-700'}`}>
                <div className="w-5 h-5 rounded-full bg-brand-gold/10 flex items-center justify-center text-[8px] font-bold text-brand-gold">
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                {u.firstName} {u.lastName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuickTaskModal({ projectId, onClose, onSaved }: { projectId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try { await tasksApi.create({ projectId, title: title.trim(), priority: 'medium', status: 'pending' }); onSaved(); }
    catch { console.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <h3 className="font-bold text-gray-900">Nový úkol</h3>
          <input className="input" placeholder="Co je potřeba udělat? *" required value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? '...' : 'Přidat'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
