import { useEffect, useState } from 'react';
import { tasksApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, X, User, Filter } from 'lucide-react';

const PRIORITY_CONFIG: Record<string, { label: string; color: string; sort: number }> = {
  urgent: { label: 'Urgentní', color: 'text-red-600 bg-red-50 border-red-200', sort: 0 },
  high: { label: 'Vysoká', color: 'text-orange-600 bg-orange-50 border-orange-200', sort: 1 },
  medium: { label: 'Střední', color: 'text-blue-600 bg-blue-50 border-blue-200', sort: 2 },
  low: { label: 'Nízká', color: 'text-gray-500 bg-gray-50 border-gray-200', sort: 3 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Čeká', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'Probíhá', color: 'bg-blue-50 text-blue-700' },
  done: { label: 'Hotovo', color: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-50 text-red-500' },
};

export default function TasksPage() {
  const { user, hasPermission } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');

  useEffect(() => {
    Promise.all([
      tasksApi.list(),
      hasPermission('users:read') ? usersApi.list().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([t, u]) => { setTasks(t.data); setUsers(u.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, completedAt } : t));
    try {
      await tasksApi.update(task.id, { status: newStatus, completedAt });
      toast.success(newStatus === 'done' ? 'Hotovo!' : 'Obnoveno');
    } catch { setTasks(prev => prev.map(t => t.id === task.id ? task : t)); }
  };

  const getUserName = (uid: string) => {
    const u = users.find(u => u.id === uid);
    return u ? `${u.firstName} ${u.lastName?.[0]}.` : '';
  };

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return t.status !== 'done' && t.status !== 'cancelled';
    return t.status === filter;
  }).sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return (PRIORITY_CONFIG[a.priority]?.sort ?? 9) - (PRIORITY_CONFIG[b.priority]?.sort ?? 9);
  });

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Úkoly</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { key: 'active', label: 'Aktivní' },
              { key: 'all', label: 'Vše' },
              { key: 'done', label: 'Hotovo' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {hasPermission('tasks:write') && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm !py-1.5">
              <Plus size={15} /> Nový úkol
            </button>
          )}
        </div>
      </div>

      {/* Table view */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Úkol</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Přiřazeno</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Priorita</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Termín</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(task => {
                const pc = PRIORITY_CONFIG[task.priority];
                const sc = STATUS_CONFIG[task.status];
                return (
                  <tr key={task.id} className={`hover:bg-gray-50/50 transition-colors ${task.status === 'done' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleTask(task)}
                        className={`${task.status === 'done' ? 'text-green-500' : 'text-gray-300 hover:text-brand-gold'} transition-colors`}>
                        {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'} cursor-pointer hover:text-brand-gold transition-colors`}
                        onClick={() => task.projectId && navigate(`/projects/${task.projectId}`)}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-gray-400 truncate max-w-[300px]">{task.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {task.assignedUserId && users.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={12} className="text-gray-400" />
                          </div>
                          <span className="text-xs text-gray-600">{getUserName(task.assignedUserId)}</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge text-[10px] ${pc?.color || ''}`}>{pc?.label || task.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <span className="text-xs text-gray-600">{new Date(task.dueDate).toLocaleDateString('cs-CZ')}</span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge text-[10px] ${sc?.color || ''}`}>{sc?.label || task.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Žádné úkoly k zobrazení</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
          {filtered.length} úkolů {filter !== 'all' ? `(filtr: ${filter === 'active' ? 'aktivní' : filter})` : ''} z celkem {tasks.length}
        </div>
      </div>

      {showForm && (
        <TaskFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); tasksApi.list().then(r => setTasks(r.data)); toast.success('Úkol vytvořen'); }}
          users={users}
        />
      )}
    </div>
  );
}

function TaskFormModal({ onClose, onSaved, users }: { onClose: () => void; onSaved: () => void; users: any[] }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignedUserId: '', dueDate: '', status: 'pending' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await tasksApi.create(form); onSaved(); }
    catch { console.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Nový úkol</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input className="input" placeholder="Název úkolu *" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          <textarea className="input min-h-[70px]" placeholder="Popis"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Nízká</option>
              <option value="medium">Střední</option>
              <option value="high">Vysoká</option>
              <option value="urgent">Urgentní</option>
            </select>
            <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          {users.length > 0 && (
            <select className="input" value={form.assignedUserId} onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}>
              <option value="">Přiřadit komu...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Ukládám...' : 'Vytvořit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
