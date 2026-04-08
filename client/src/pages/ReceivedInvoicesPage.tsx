import { useEffect, useState } from 'react';
import { receivedInvoicesApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FileText, Upload, X, Scan } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ke schválení', approved: 'Schváleno', paid: 'Zaplaceno', rejected: 'Zamítnuto',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700', approved: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-700',
};

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export default function ReceivedInvoicesPage() {
  const toast = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  const loadData = () => {
    receivedInvoicesApi.list()
      .then(res => setInvoices(res.data))
      .catch(() => toast.error('Nepodařilo se načíst přijaté faktury'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const totals = {
    pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0),
    approved: invoices.filter(i => i.status === 'approved').reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Přijaté faktury</h1>
          <p className="text-gray-500 mt-1">Doklady od dodavatelů materiálu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowOcr(true)} className="btn-secondary">
            <Scan size={16} /> OCR Import
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Upload size={16} /> Nová faktura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-sm text-gray-500">Ke schválení</span>
          <p className="text-2xl font-bold text-yellow-600">{formatCZK(totals.pending)}</p>
        </div>
        <div className="stat-card">
          <span className="text-sm text-gray-500">Schváleno (k platbě)</span>
          <p className="text-2xl font-bold text-blue-600">{formatCZK(totals.approved)}</p>
        </div>
        <div className="stat-card">
          <span className="text-sm text-gray-500">Zaplaceno</span>
          <p className="text-2xl font-bold text-green-600">{formatCZK(totals.paid)}</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Dodavatel</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Číslo faktury</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Splatnost</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Částka</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{inv.supplierName}</p>
                    {inv.supplierIco && <p className="text-xs text-gray-400">IČO: {inv.supplierIco}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inv.dueDate).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCZK(inv.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${STATUS_COLORS[inv.status]}`}>{STATUS_LABELS[inv.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>Žádné přijaté faktury</p>
          </div>
        )}
      </div>

      {showOcr && (
        <OcrModal
          onClose={() => setShowOcr(false)}
          onExtracted={(data) => {
            setShowOcr(false);
            setShowForm(true);
            toast.info('Data extrahována z OCR. Zkontrolujte a uložte.');
          }}
        />
      )}

      {showForm && (
        <ReceivedInvoiceForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadData(); toast.success('Faktura přidána'); }}
        />
      )}
    </div>
  );
}

function OcrModal({ onClose, onExtracted }: { onClose: () => void; onExtracted: (data: any) => void }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!text.trim()) { toast.warning('Vložte text faktury'); return; }
    setLoading(true);
    try {
      const res = await receivedInvoicesApi.ocr(text);
      onExtracted(res.data);
    } catch {
      toast.error('OCR extrakce selhala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Scan size={20} className="text-brand-gold" /> OCR Import faktury
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Vložte text z naskenované faktury. AI systém automaticky rozpozná dodavatele, IČO, částku a datum splatnosti.
          </p>
          <textarea
            className="input min-h-[200px] font-mono text-xs"
            placeholder="Sem vložte text z faktury nebo OCR výstup..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">Zrušit</button>
            <button onClick={handleExtract} disabled={loading} className="btn-primary">
              <Scan size={16} /> {loading ? 'Zpracovávám...' : 'Extrahovat data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceivedInvoiceForm({ onClose, onSaved, initialData }: { onClose: () => void; onSaved: () => void; initialData?: any }) {
  const toast = useToast();
  const [form, setForm] = useState({
    supplierName: initialData?.supplierName || '',
    supplierIco: initialData?.supplierIco || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
    dueDate: initialData?.dueDate || '',
    subtotal: initialData?.subtotal?.toString() || '',
    vatTotal: initialData?.vatTotal?.toString() || '',
    total: initialData?.total?.toString() || '',
    status: 'pending',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await receivedInvoicesApi.create({
        ...form,
        subtotal: parseFloat(form.subtotal) || 0,
        vatTotal: parseFloat(form.vatTotal) || 0,
        total: parseFloat(form.total) || 0,
        currency: 'CZK',
      });
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Nepodařilo se uložit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Přijatá faktura</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input className="input" placeholder="Dodavatel *" required value={form.supplierName} onChange={e => set('supplierName', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="IČO dodavatele" value={form.supplierIco} onChange={e => set('supplierIco', e.target.value)} />
            <input className="input" placeholder="Číslo faktury *" required value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Datum vystavení</label>
              <input type="date" className="input" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Splatnost *</label>
              <input type="date" className="input" required value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Základ</label>
              <input type="number" className="input" placeholder="0" value={form.subtotal} onChange={e => set('subtotal', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">DPH</label>
              <input type="number" className="input" placeholder="0" value={form.vatTotal} onChange={e => set('vatTotal', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Celkem *</label>
              <input type="number" className="input" placeholder="0" required value={form.total} onChange={e => set('total', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Ukládám...' : 'Uložit fakturu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
