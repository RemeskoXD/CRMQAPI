import { useEffect, useState } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Navigate } from 'react-router-dom';
import { Shield, User, Mail, Phone, Plus, X, Edit2 } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  root: 'Administrátor',
  team_leader: 'Team Leader',
  sales_rep: 'Obchodní zástupce',
  technician: 'Technik',
  analyst: 'Analytik',
  infoline: 'Infolinka',
  accountant: 'Účetní',
};

const ROLE_COLORS: Record<string, string> = {
  root: 'bg-red-50 text-red-700',
  team_leader: 'bg-blue-50 text-blue-700',
  sales_rep: 'bg-green-50 text-green-700',
  technician: 'bg-orange-50 text-orange-700',
  analyst: 'bg-purple-50 text-purple-700',
  infoline: 'bg-pink-50 text-pink-700',
  accountant: 'bg-cyan-50 text-cyan-700',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const canAccess = hasRole('root', 'team_leader');

  useEffect(() => {
    if (!canAccess) return;
    usersApi.list()
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Nepodařilo se načíst uživatele'))
      .finally(() => setLoading(false));
  }, [canAccess]);

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = Object.entries(ROLE_LABELS).map(([role, label]) => ({
    role,
    label,
    users: users.filter(u => u.role === role),
  })).filter(g => g.users.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa uživatelů</h1>
          <p className="text-gray-500 mt-1">{users.length} uživatelů v systému</p>
        </div>
        {hasRole('root') && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Nový uživatel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="stat-card">
              <div className="flex items-center justify-between">
                <span className={`badge ${ROLE_COLORS[role]}`}>{label}</span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {grouped.map(group => (
        <div key={group.role}>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Shield size={18} className="text-brand-gold" />
            {group.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.users.map((u: any) => (
              <div key={u.id} className="card flex items-center gap-4 !p-4">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-gold font-bold text-lg">
                    {u.firstName[0]}{u.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail size={12} /> <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Phone size={12} /> {u.phone}
                    </div>
                  )}
                </div>
                <span className={`badge text-xs ${ROLE_COLORS[u.role]}`}>
                  {ROLE_LABELS[u.role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <UserFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            usersApi.list().then(r => setUsers(r.data));
            toast.success('Uživatel vytvořen');
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'technician', phone: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { api: apiClient } = await import('../services/api');
      await apiClient.post('/users', { ...form, isActive: true });
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Nepodařilo se vytvořit uživatele');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Nový uživatel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Jméno *" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            <input className="input" placeholder="Příjmení *" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
          <input type="email" className="input" placeholder="E-mail *" required value={form.email} onChange={e => set('email', e.target.value)} />
          <input type="password" className="input" placeholder="Heslo *" required value={form.password} onChange={e => set('password', e.target.value)} />
          <input className="input" placeholder="Telefon" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Ukládám...' : 'Vytvořit uživatele'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
