import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Phone, PhoneCall, Plus, X, Clock, CheckCircle2, User, MessageSquare, ArrowRight } from 'lucide-react';

type ApiRes<T> = { success: boolean; data: T };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Nový', color: 'bg-blue-50 text-blue-700' },
  contacted: { label: 'Kontaktován', color: 'bg-yellow-50 text-yellow-700' },
  qualified: { label: 'Kvalifikován', color: 'bg-purple-50 text-purple-700' },
  converted: { label: 'Převeden', color: 'bg-green-50 text-green-700' },
  lost: { label: 'Ztracen', color: 'bg-gray-100 text-gray-500' },
};

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function LeadsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [callLead, setCallLead] = useState<any>(null);

  const load = () => {
    api.get<ApiRes<any[]>>('/leads')
      .then(r => setLeads(r.data))
      .catch(() => toast.error('Chyba'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateLead = async (id: string, data: any) => {
    try {
      const res = await api.patch<ApiRes<any>>(`/leads/${id}`, data);
      setLeads(prev => prev.map(l => l.id === id ? res.data : l));
    } catch { toast.error('Chyba'); }
  };

  const markContacted = async (lead: any) => {
    await updateLead(lead.id, {
      status: lead.status === 'new' ? 'contacted' : lead.status,
      lastContactedAt: new Date().toISOString(),
    });
    toast.success('Označeno jako kontaktováno');
    setCallLead(null);
  };

  const filtered = leads.filter(l => {
    if (filter === 'active') return !['converted', 'lost'].includes(l.status);
    if (filter === 'today') return l.nextCallAt && l.nextCallAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const todayCount = leads.filter(l => l.nextCallAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const newCount = leads.filter(l => l.status === 'new').length;

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leady</h1>
          <p className="text-xs text-gray-500">Seznam poptávek k obvolání</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm !py-1.5">
          <Plus size={15} /> Nový lead
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card cursor-pointer hover:border-brand-gold/20" onClick={() => setFilter('today')}>
          <span className="text-xs text-gray-500">Dnes zavolat</span>
          <p className="text-xl font-bold text-brand-gold">{todayCount}</p>
        </div>
        <div className="stat-card cursor-pointer hover:border-brand-gold/20" onClick={() => setFilter('new')}>
          <span className="text-xs text-gray-500">Noví</span>
          <p className="text-xl font-bold text-blue-600">{newCount}</p>
        </div>
        <div className="stat-card"><span className="text-xs text-gray-500">Celkem aktivních</span><p className="text-xl font-bold text-gray-900">{leads.filter(l => !['converted','lost'].includes(l.status)).length}</p></div>
        <div className="stat-card"><span className="text-xs text-gray-500">Převedeno</span><p className="text-xl font-bold text-green-600">{leads.filter(l => l.status === 'converted').length}</p></div>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
        {[{ k: 'today', l: 'Dnes' }, { k: 'active', l: 'Aktivní' }, { k: 'new', l: 'Noví' }, { k: 'contacted', l: 'Kontaktováni' }, { k: 'all', l: 'Vše' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filter === f.k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>{f.l}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(lead => {
          const sc = STATUS_CONFIG[lead.status];
          const isToday = lead.nextCallAt?.slice(0, 10) === new Date().toISOString().slice(0, 10);
          return (
            <div key={lead.id} className={`card !p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${isToday ? 'border-brand-gold/30 bg-brand-gold/[0.02]' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-gray-900">{lead.clientName}</p>
                  <span className={`badge text-[10px] ${sc.color}`}>{sc.label}</span>
                  {lead.source && <span className="text-[10px] text-gray-400">{lead.source}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>
                  {lead.email && <span>{lead.email}</span>}
                  {lead.lastContactedAt && <span className="flex items-center gap-1"><Clock size={10} />Kontakt: {timeAgo(lead.lastContactedAt)}</span>}
                </div>
                {lead.notes && <p className="text-xs text-gray-400 mt-1 truncate">{lead.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lead.nextCallAt && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isToday ? 'bg-brand-gold/10 text-brand-gold' : 'bg-gray-100 text-gray-500'}`}>
                    {isToday ? 'Dnes' : new Date(lead.nextCallAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                <a href={`tel:${lead.phone}`} onClick={() => setCallLead(lead)}
                  className="w-9 h-9 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center text-green-600 transition-colors" title="Zavolat">
                  <PhoneCall size={16} />
                </a>
                <button onClick={() => markContacted(lead)}
                  className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 transition-colors" title="Kontaktováno">
                  <CheckCircle2 size={16} />
                </button>
                {lead.status === 'contacted' && (
                  <button onClick={() => updateLead(lead.id, { status: 'qualified' })}
                    className="w-9 h-9 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 transition-colors" title="Kvalifikovat">
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Žádné leady v tomto filtru</p>}
      </div>

      {showForm && <LeadForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); toast.success('Lead přidán'); }} />}
    </div>
  );
}

function LeadForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ clientName: '', phone: '', email: '', source: '', notes: '', nextCallAt: new Date().toISOString().slice(0, 10), status: 'new', assignedUserId: user?.id || '', assignedUserName: `${user?.firstName} ${user?.lastName}` });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await api.post('/leads', form); onSaved(); }
    catch { console.error('err'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Nový lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input className="input" placeholder="Jméno / Firma *" required value={form.clientName} onChange={e => set('clientName', e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Telefon *" required value={form.phone} onChange={e => set('phone', e.target.value)} />
            <input className="input" placeholder="E-mail" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="input text-sm" value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="">Zdroj</option>
              <option>Google Ads</option><option>Facebook</option><option>Doporučení</option>
              <option>Webový formulář</option><option>qapi.cz</option><option>Seznam SKLIK</option><option>Telefon</option>
            </select>
            <input type="date" className="input text-sm" value={form.nextCallAt} onChange={e => set('nextCallAt', e.target.value)} />
          </div>
          <textarea className="input min-h-[60px] text-sm" placeholder="Poznámky..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? '...' : 'Přidat lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
