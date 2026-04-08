import { useEffect, useState } from 'react';
import { inventoryApi, api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Package, Search, AlertTriangle, MapPin, Plus, ArrowDown, ArrowUp, X, History, Warehouse } from 'lucide-react';

type ApiRes<T> = { success: boolean; data: T };

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

const CATEGORY_LABELS: Record<string, string> = { garage_doors: 'Garážová vrata', windows: 'Okna', shading: 'Stínění' };

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'items' | 'warehouses' | 'movements'>('items');
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showMovementForm, setShowMovementForm] = useState<'in' | 'out' | null>(null);

  useEffect(() => {
    Promise.all([
      inventoryApi.list({ ...(search ? { search } : {}), ...(category ? { category } : {}) }),
      api.get<ApiRes<any[]>>('/warehouses'),
      api.get<ApiRes<any[]>>('/warehouses/movements'),
    ]).then(([it, wh, mv]) => {
      setItems(it.data);
      setWarehouses(wh.data);
      setMovements(mv.data);
    }).catch(() => toast.error('Chyba'))
      .finally(() => setLoading(false));
  }, [search, category]);

  const totalValue = items.reduce((s, i) => s + i.stockQuantity * i.pricePerUnit, 0);
  const lowStock = items.filter(i => i.stockQuantity <= i.minStockLevel);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Sklad</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { id: 'items', label: 'Položky' },
              { id: 'warehouses', label: 'Sklady' },
              { id: 'movements', label: 'Pohyby' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {hasRole('root', 'admin') && (
            <div className="flex gap-1">
              <button onClick={() => setShowMovementForm('in')} className="btn-primary text-xs !py-1 !px-2.5">
                <ArrowDown size={13} /> Příjem
              </button>
              <button onClick={() => setShowMovementForm('out')} className="btn-secondary text-xs !py-1 !px-2.5">
                <ArrowUp size={13} /> Výdej
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card"><span className="text-xs text-gray-500">Položek</span><p className="text-xl font-bold text-gray-900">{items.length}</p></div>
        <div className="stat-card"><span className="text-xs text-gray-500">Hodnota skladu</span><p className="text-xl font-bold text-brand-gold">{formatCZK(totalValue)}</p></div>
        <div className="stat-card"><span className="text-xs text-gray-500">Skladů</span><p className="text-xl font-bold text-blue-600">{warehouses.length}</p></div>
        <div className="stat-card">
          <span className="text-xs text-gray-500">Nízký stav</span>
          <p className={`text-xl font-bold ${lowStock.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStock.length}</p>
        </div>
      </div>

      {tab === 'items' && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input !py-1.5 !pl-8 text-sm" placeholder="Hledat položku..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[{ k: '', l: 'Vše' }, { k: 'garage_doors', l: 'Vrata' }, { k: 'windows', l: 'Okna' }, { k: 'shading', l: 'Stínění' }].map(f => (
                <button key={f.k} onClick={() => setCategory(f.k)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${category === f.k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="card !p-0 overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Položka</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden md:table-cell">Kategorie</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Skladem</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden sm:table-cell">Cena/ks</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Hodnota</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => {
                  const low = item.stockQuantity <= item.minStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-xs text-gray-600">{CATEGORY_LABELS[item.category]}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-sm font-bold ${low ? 'text-red-600' : 'text-gray-900'}`}>{item.stockQuantity}</span>
                        <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                        {low && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-gray-600 hidden sm:table-cell">{formatCZK(item.pricePerUnit)}</td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">{formatCZK(item.stockQuantity * item.pricePerUnit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh: any) => (
            <div key={wh.id} className="card !p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Warehouse size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{wh.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {wh.street}, {wh.city} {wh.zip}
                  </p>
                  {wh.notes && <p className="text-xs text-gray-400 mt-1">{wh.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'movements' && (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Typ</th>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Položka</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Množství</th>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden md:table-cell">Důvod</th>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden sm:table-cell">Kdo</th>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Kdy</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {movements.map((mv: any) => (
                <tr key={mv.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    {mv.type === 'in'
                      ? <span className="badge bg-green-50 text-green-700 text-[10px]"><ArrowDown size={10} className="mr-0.5" />Příjem</span>
                      : <span className="badge bg-red-50 text-red-700 text-[10px]"><ArrowUp size={10} className="mr-0.5" />Výdej</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{mv.itemName}</td>
                  <td className="px-5 py-3 text-right text-sm font-bold">{mv.type === 'in' ? '+' : '-'}{mv.quantity}</td>
                  <td className="px-5 py-3 text-xs text-gray-600 hidden md:table-cell">{mv.reason}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell">{mv.userName}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(mv.createdAt).toLocaleDateString('cs-CZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMovementForm && (
        <MovementForm type={showMovementForm} items={items} warehouses={warehouses}
          onClose={() => setShowMovementForm(null)}
          onSaved={() => {
            setShowMovementForm(null);
            api.get<ApiRes<any[]>>('/warehouses/movements').then(r => setMovements(r.data));
            toast.success(showMovementForm === 'in' ? 'Příjem zaznamenán' : 'Výdej zaznamenán');
          }} />
      )}
    </div>
  );
}

function MovementForm({ type, items, warehouses, onClose, onSaved }: any) {
  const [form, setForm] = useState({ warehouseId: warehouses[0]?.id || '', inventoryItemId: '', quantity: 1, reason: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const selectedItem = items.find((i: any) => i.id === form.inventoryItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/warehouses/movements', {
        ...form,
        type,
        itemName: selectedItem?.name || '',
        quantity: Number(form.quantity),
      });
      onSaved();
    } catch { console.error('err'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {type === 'in' ? <><ArrowDown size={18} className="text-green-600" /> Příjem na sklad</> : <><ArrowUp size={18} className="text-red-600" /> Výdej ze skladu</>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Sklad</label>
            <select className="input text-sm" value={form.warehouseId} onChange={e => set('warehouseId', e.target.value)} required>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} - {w.city}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Položka *</label>
            <select className="input text-sm" value={form.inventoryItemId} onChange={e => set('inventoryItemId', e.target.value)} required>
              <option value="">Vyberte položku</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.sku}) - skladem: {i.stockQuantity}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Množství *</label>
              <input type="number" className="input text-sm" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Aktuálně</label>
              <p className="input bg-gray-50 text-sm">{selectedItem?.stockQuantity ?? '—'} {selectedItem?.unit || 'ks'}</p>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Důvod *</label>
            <input className="input text-sm" placeholder={type === 'in' ? 'Nákup od dodavatele...' : 'Pro zakázku...'} value={form.reason} onChange={e => set('reason', e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Zrušit</button>
            <button type="submit" disabled={saving} className={`text-sm ${type === 'in' ? 'btn-primary' : 'btn-danger'}`}>
              {saving ? '...' : type === 'in' ? 'Příjem' : 'Výdej'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
