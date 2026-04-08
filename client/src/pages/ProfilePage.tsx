import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Phone, Shield, Lock, Save, Camera } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  root: 'Administrátor', admin: 'Admin', team_leader: 'Team Leader',
  sales_rep: 'Obchodní zástupce', technician: 'Technik',
  analyst: 'Analytik', infoline: 'Infolinka', accountant: 'Účetní',
};

const ROLE_COLORS: Record<string, string> = {
  root: 'bg-red-50 text-red-700', admin: 'bg-red-50 text-red-700',
  team_leader: 'bg-blue-50 text-blue-700', sales_rep: 'bg-green-50 text-green-700',
  technician: 'bg-orange-50 text-orange-700', analyst: 'bg-purple-50 text-purple-700',
  infoline: 'bg-pink-50 text-pink-700', accountant: 'bg-cyan-50 text-cyan-700',
};

type ApiRes<T> = { success: boolean; data: T; error?: string; message?: string };

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    api.get<ApiRes<any>>('/profile')
      .then(res => {
        setProfile(res.data);
        setForm({ firstName: res.data.firstName, lastName: res.data.lastName, phone: res.data.phone || '' });
      })
      .catch(() => toast.error('Chyba načítání profilu'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch<ApiRes<any>>('/profile', form);
      setProfile(res.data);
      localStorage.setItem('crmq_user', JSON.stringify(res.data));
      toast.success('Profil uložen');
    } catch (err: any) { toast.error(err.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Hesla se neshodují');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Heslo musí mít alespoň 6 znaků');
      return;
    }
    setChangingPw(true);
    try {
      await api.post<ApiRes<any>>('/profile/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Heslo bylo změněno');
    } catch (err: any) { toast.error(err.message || 'Chyba změny hesla'); }
    finally { setChangingPw(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card !p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
            <span className="text-brand-gold text-2xl font-bold">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-brand-gold transition-colors border"
            title="Změnit avatar (brzy)">
            <Camera size={13} />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
            <Mail size={13} /> {profile?.email}
          </p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className={`badge ${ROLE_COLORS[profile?.role] || 'bg-gray-100 text-gray-600'}`}>
              <Shield size={10} className="mr-1" />{ROLE_LABELS[profile?.role] || profile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <User size={16} className="text-brand-gold" /> Osobní údaje
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Jméno</label>
              <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Příjmení</label>
              <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Telefon</label>
            <input className="input" placeholder="+420..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">E-mail</label>
            <input className="input bg-gray-50 cursor-not-allowed" disabled value={profile?.email || ''} />
            <p className="text-[10px] text-gray-400 mt-1">E-mail může změnit pouze administrátor</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              <Save size={14} /> {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Lock size={16} className="text-brand-gold" /> Změna hesla
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Aktuální heslo</label>
            <input type="password" className="input" required value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Nové heslo</label>
              <input type="password" className="input" required minLength={6} value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Potvrzení</label>
              <input type="password" className="input" required value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={changingPw} className="btn-secondary text-sm">
              <Lock size={14} /> {changingPw ? 'Měním...' : 'Změnit heslo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
