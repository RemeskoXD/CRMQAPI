import { useEffect, useState } from 'react';
import { clientsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Plus, Building2, User, Phone, Mail, MapPin, ChevronRight, X, LayoutGrid, List } from 'lucide-react';

const SOURCE_COLORS: Record<string, string> = {
  'Google Ads': 'bg-blue-50 text-blue-700',
  'Facebook': 'bg-indigo-50 text-indigo-700',
  'Doporučení': 'bg-green-50 text-green-700',
  'Webový formulář': 'bg-purple-50 text-purple-700',
};

export default function ClientsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [view, setView] = useState<'cards' | 'table'>('table');

  const loadClients = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    clientsApi.list(params)
      .then(res => setClients(res.data))
      .catch(() => toast.error('Nepodařilo se načíst klienty'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadClients(); }, [search]);

  const displayName = (c: any) => c.type === 'company' ? c.companyName : `${c.firstName} ${c.lastName}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Klienti</h1>
          <p className="text-xs text-gray-500 mt-0.5">{clients.length} kontaktů</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm !py-1.5 sm:w-[260px]" placeholder="Hledat jméno, IČO, e-mail..." />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
              <List size={16} />
            </button>
            <button onClick={() => setView('cards')}
              className={`p-1.5 rounded-md transition-all ${view === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
          {hasPermission('clients:write') && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm !py-1.5">
              <Plus size={15} /> Nový klient
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : view === 'table' ? (
        /* TABLE VIEW */
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Jméno / Název</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Kontakt</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Město</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Zdroj</th>
                  <th className="w-8 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <Link to={`/clients/${client.id}`} className="flex items-center gap-3 group/link">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          client.type === 'company' ? 'bg-blue-50' : 'bg-purple-50'
                        }`}>
                          {client.type === 'company' ? <Building2 size={16} className="text-blue-600" /> : <User size={16} className="text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 group-hover/link:text-brand-gold transition-colors">{displayName(client)}</p>
                          {client.ico && <p className="text-[10px] text-gray-400">IČO: {client.ico}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {client.email && <p className="flex items-center gap-1"><Mail size={10} className="text-gray-400" />{client.email}</p>}
                        {client.phone && <p className="flex items-center gap-1"><Phone size={10} className="text-gray-400" />{client.phone}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-xs text-gray-600">{client.billingCity || '—'}</td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      {client.marketingSource ? (
                        <span className={`badge text-[10px] ${SOURCE_COLORS[client.marketingSource] || 'bg-gray-50 text-gray-600'}`}>
                          {client.marketingSource}
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/clients/${client.id}`}>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-gold transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Žádní klienti nenalezeni</p>
            </div>
          )}
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {clients.map(client => (
            <Link key={client.id} to={`/clients/${client.id}`}
              className="card !p-4 hover:shadow-md hover:border-brand-gold/20 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${client.type === 'company' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                    {client.type === 'company' ? <Building2 size={18} className="text-blue-600" /> : <User size={18} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-gold transition-colors">{displayName(client)}</p>
                    {client.ico && <p className="text-[10px] text-gray-400">IČO: {client.ico}</p>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-gold transition-colors mt-1" />
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                {client.email && <p className="flex items-center gap-1.5"><Mail size={11} className="text-gray-400" />{client.email}</p>}
                {client.phone && <p className="flex items-center gap-1.5"><Phone size={11} className="text-gray-400" />{client.phone}</p>}
                {client.billingCity && <p className="flex items-center gap-1.5"><MapPin size={11} className="text-gray-400" />{client.billingCity}</p>}
              </div>
              {client.marketingSource && (
                <div className="mt-2.5">
                  <span className={`badge text-[10px] ${SOURCE_COLORS[client.marketingSource] || 'bg-gray-50 text-gray-600'}`}>{client.marketingSource}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showForm && <ClientFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadClients(); toast.success('Klient vytvořen'); }} />}
    </div>
  );
}

function ClientFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    type: 'company' as 'company' | 'individual',
    companyName: '', firstName: '', lastName: '',
    ico: '', dic: '', email: '', phone: '',
    marketingSource: '', billingStreet: '', billingCity: '', billingZip: '', billingCountry: 'CZ',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await clientsApi.create(form); onSaved(); }
    catch { console.error('Failed'); }
    finally { setSaving(false); }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Nový klient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-2">
            {[
              { val: 'company', label: 'Firma', icon: Building2 },
              { val: 'individual', label: 'Fyzická osoba', icon: User },
            ].map(opt => (
              <button key={opt.val} type="button" onClick={() => set('type', opt.val)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.type === opt.val ? 'border-brand-gold bg-brand-gold/5 text-brand-gold' : 'border-gray-200 text-gray-500'
                }`}>
                <opt.icon size={16} /> {opt.label}
              </button>
            ))}
          </div>

          {form.type === 'company' ? (
            <>
              <input className="input" placeholder="Název firmy *" value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="IČO" value={form.ico} onChange={e => set('ico', e.target.value)} />
                <input className="input" placeholder="DIČ" value={form.dic} onChange={e => set('dic', e.target.value)} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Jméno *" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              <input className="input" placeholder="Příjmení *" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input type="email" className="input" placeholder="E-mail" value={form.email} onChange={e => set('email', e.target.value)} />
            <input className="input" placeholder="Telefon" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>

          <select className="input" value={form.marketingSource} onChange={e => set('marketingSource', e.target.value)}>
            <option value="">Zdroj poptávky</option>
            <option>Google Ads</option><option>Facebook</option><option>Doporučení</option>
            <option>Webový formulář</option><option>qapi.cz</option><option>Jiný</option>
          </select>

          <input className="input" placeholder="Ulice" value={form.billingStreet} onChange={e => set('billingStreet', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Město" value={form.billingCity} onChange={e => set('billingCity', e.target.value)} />
            <input className="input" placeholder="PSČ" value={form.billingZip} onChange={e => set('billingZip', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Ukládám...' : 'Vytvořit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
