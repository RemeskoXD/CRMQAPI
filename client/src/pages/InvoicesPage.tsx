import { useEffect, useState } from 'react';
import { invoicesApi, clientsApi, projectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
  FileText, Download, Plus, X, Send, Eye, Trash2,
  Receipt, ArrowRight, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = { quote: 'Cenová nabídka', advance: 'Zálohová faktura', invoice: 'Daňový doklad' };
const TYPE_SHORT: Record<string, string> = { quote: 'Nabídka', advance: 'Záloha', invoice: 'Faktura' };
const STATUS_LABELS: Record<string, string> = { draft: 'Koncept', sent: 'Odesláno', paid: 'Zaplaceno', overdue: 'Po splatnosti', cancelled: 'Zrušeno' };
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700', overdue: 'bg-red-50 text-red-700', cancelled: 'bg-gray-100 text-gray-400',
};
const STATUS_ICONS: Record<string, any> = {
  draft: FileText, sent: Send, paid: CheckCircle2, overdue: AlertTriangle, cancelled: X,
};

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export default function InvoicesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'issued' | 'received'>('issued');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadInvoices = () => {
    const params: Record<string, string> = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    invoicesApi.list(params)
      .then(res => setInvoices(res.data))
      .catch(() => toast.error('Chyba načítání'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadInvoices(); }, [typeFilter, statusFilter]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await invoicesApi.update(id, { status });
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selectedInvoice?.id === id) setSelectedInvoice((s: any) => ({ ...s, status }));
      toast.success(`Stav změněn na "${STATUS_LABELS[status]}"`);
    } catch { toast.error('Chyba'); }
  };

  const sendInvoice = async (id: string) => {
    try {
      const res = await invoicesApi.update(id, { status: 'sent' });
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'sent' } : i));
      toast.success('Doklad označen jako odeslaný. Až nastavíte SMTP, bude odesílat automaticky.');
    } catch { toast.error('Chyba'); }
  };

  const totals = {
    all: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Ekonomika</h1>
        <div className="flex items-center gap-2">
          {/* Taby */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTab('issued')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'issued' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              Vydané doklady
            </button>
            <Link to="/received-invoices" className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 transition-all">
              Přijaté
            </Link>
          </div>
          {hasPermission('invoices:write') && (
            <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm !py-1.5">
              <Plus size={15} /> Vystavit doklad
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Celkem</span>
            <FileText size={16} className="text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCZK(totals.all)}</p>
          <p className="text-[10px] text-gray-400">{invoices.length} dokladů</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Zaplaceno</span>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <p className="text-lg font-bold text-green-600">{formatCZK(totals.paid)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Čeká na platbu</span>
            <Clock size={16} className="text-yellow-500" />
          </div>
          <p className="text-lg font-bold text-yellow-600">{formatCZK(totals.pending)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Po splatnosti</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <p className="text-lg font-bold text-red-600">{formatCZK(totals.overdue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {[{ k: '', l: 'Vše' }, { k: 'quote', l: 'Nabídky' }, { k: 'advance', l: 'Zálohy' }, { k: 'invoice', l: 'Faktury' }].map(f => (
            <button key={f.k} onClick={() => setTypeFilter(f.k)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${typeFilter === f.k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {[{ k: '', l: 'Vše' }, { k: 'draft', l: 'Koncepty' }, { k: 'sent', l: 'Odeslané' }, { k: 'paid', l: 'Zaplacené' }, { k: 'overdue', l: 'Po spl.' }].map(f => (
            <button key={f.k} onClick={() => setStatusFilter(f.k)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${statusFilter === f.k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Číslo dokladu</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden md:table-cell">Typ</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3 hidden lg:table-cell">Vystaveno</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Splatnost</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Částka</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Stav</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase px-5 py-3">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const StatusIcon = STATUS_ICONS[inv.status] || FileText;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <button onClick={() => setSelectedInvoice(inv)} className="font-semibold text-sm text-gray-900 hover:text-brand-gold transition-colors">
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-xs text-gray-600">{TYPE_SHORT[inv.type]}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-xs text-gray-500">{new Date(inv.issueDate).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{new Date(inv.dueDate).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-5 py-3 text-right font-semibold text-sm text-gray-900">{formatCZK(inv.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`badge text-[10px] ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Detail">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => window.open(`/api/pdf/invoice/${inv.id}`, '_blank')} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="PDF">
                          <Download size={14} />
                        </button>
                        {inv.status === 'draft' && (
                          <button onClick={() => sendInvoice(inv.id)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Odeslat">
                            <Send size={14} />
                          </button>
                        )}
                        {inv.status === 'sent' && (
                          <button onClick={() => changeStatus(inv.id, 'paid')} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Označit zaplaceno">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Žádné doklady</p>
          </div>
        )}
        <div className="px-5 py-2.5 border-t bg-gray-50/50 text-xs text-gray-500">
          {invoices.length} dokladů
        </div>
      </div>

      {selectedInvoice && <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)}
        onStatusChange={(status) => changeStatus(selectedInvoice.id, status)}
        onSend={() => sendInvoice(selectedInvoice.id)} />}

      {showCreateForm && <InvoiceCreateForm onClose={() => setShowCreateForm(false)}
        onSaved={() => { setShowCreateForm(false); loadInvoices(); toast.success('Doklad vytvořen'); }} />}
    </div>
  );
}

// ===== INVOICE DETAIL MODAL =====
function InvoiceDetail({ invoice, onClose, onStatusChange, onSend }: {
  invoice: any; onClose: () => void; onStatusChange: (status: string) => void; onSend: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-gray-500">{TYPE_LABELS[invoice.type]}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${STATUS_COLORS[invoice.status]}`}>{STATUS_LABELS[invoice.status]}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 text-sm mb-5">
            <div><p className="text-xs text-gray-500">Vystaveno</p><p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}</p></div>
            <div><p className="text-xs text-gray-500">Splatnost</p><p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}</p></div>
          </div>

          <table className="w-full text-sm mb-5">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">Položka</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 w-16">Ks</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 w-24">Cena/ks</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 w-16">DPH</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 w-28">Celkem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(invoice.items || []).map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="py-2 text-gray-800">{item.description}</td>
                  <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatCZK(item.unitPrice)}</td>
                  <td className="py-2 text-right text-gray-500">{item.vatRate}%</td>
                  <td className="py-2 text-right font-semibold">{formatCZK(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-gray-200 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Základ</span><span>{formatCZK(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">DPH</span><span>{formatCZK(invoice.vatTotal)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>K úhradě</span>
              <span className="text-brand-gold">{formatCZK(invoice.total)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t bg-gray-50 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {invoice.status === 'draft' && (
              <button onClick={onSend} className="btn-primary text-sm"><Send size={14} /> Odeslat klientovi</button>
            )}
            {invoice.status === 'sent' && (
              <button onClick={() => onStatusChange('paid')} className="btn-primary text-sm !bg-green-600 hover:!bg-green-700"><CheckCircle2 size={14} /> Označit zaplaceno</button>
            )}
            {invoice.status === 'paid' && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle2 size={16} /> Zaplaceno</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(`/api/pdf/invoice/${invoice.id}`, '_blank')} className="btn-secondary text-sm">
              <Download size={14} /> PDF
            </button>
            <button onClick={onClose} className="btn-secondary text-sm">Zavřít</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== INVOICE CREATE FORM - full invoicing =====
function InvoiceCreateForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: 'invoice' as string,
    clientId: '',
    projectId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    notes: '',
  });
  const [items, setItems] = useState<any[]>([
    { description: '', quantity: 1, unitPrice: 0, vatRate: 21 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientsApi.list().then(r => setClients(r.data)).catch(() => {});
    projectsApi.list().then(r => setProjects(r.data)).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const setItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, vatRate: 21 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const calcItemTotal = (item: any) => Math.round(item.quantity * item.unitPrice * (1 + item.vatRate / 100));
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const vatTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
  const total = items.reduce((s, i) => s + calcItemTotal(i), 0);

  const clientName = (c: any) => c.type === 'company' ? c.companyName : `${c.firstName} ${c.lastName}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) { toast.warning('Vyberte klienta'); return; }
    if (items.length === 0 || !items[0].description) { toast.warning('Přidejte alespoň jednu položku'); return; }
    setSaving(true);
    try {
      await invoicesApi.create({
        ...form,
        items: items.filter(i => i.description),
      });
      onSaved();
    } catch (err: any) { toast.error(err.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold">Vystavit doklad</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'quote', label: 'Cenová nabídka', desc: 'Nezávazná nabídka' },
              { key: 'advance', label: 'Záloha', desc: 'Zálohová faktura' },
              { key: 'invoice', label: 'Faktura', desc: 'Daňový doklad' },
            ].map(t => (
              <button key={t.key} type="button" onClick={() => set('type', t.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.type === t.key ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <p className={`text-sm font-semibold ${form.type === t.key ? 'text-brand-gold' : 'text-gray-700'}`}>{t.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>

          {/* Client + Project + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Odběratel *</label>
              <select className="input text-sm" required value={form.clientId} onChange={e => set('clientId', e.target.value)}>
                <option value="">Vyberte klienta</option>
                {clients.map(c => <option key={c.id} value={c.id}>{clientName(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Zakázka</label>
              <select className="input text-sm" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                <option value="">— žádná —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Datum vystavení</label>
              <input type="date" className="input text-sm" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Datum splatnosti</label>
              <input type="date" className="input text-sm" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">Položky</label>
              <button type="button" onClick={addItem} className="text-xs text-brand-gold hover:text-brand-gold-dark font-semibold flex items-center gap-1">
                <Plus size={12} /> Přidat položku
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <input className="input text-sm" placeholder="Popis položky *" value={item.description}
                      onChange={e => setItem(idx, 'description', e.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Množství</label>
                        <input type="number" className="input text-sm" min="1" value={item.quantity}
                          onChange={e => setItem(idx, 'quantity', Number(e.target.value) || 1)} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Cena/ks (bez DPH)</label>
                        <input type="number" className="input text-sm" min="0" value={item.unitPrice}
                          onChange={e => setItem(idx, 'unitPrice', Number(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">DPH %</label>
                        <select className="input text-sm" value={item.vatRate} onChange={e => setItem(idx, 'vatRate', Number(e.target.value))}>
                          <option value={21}>21%</option>
                          <option value={15}>15%</option>
                          <option value={12}>12%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 pt-1">
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCZK(calcItemTotal(item))}</p>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-brand-dark rounded-xl p-4 text-white">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Základ</span>
              <span>{formatCZK(Math.round(subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">DPH</span>
              <span>{formatCZK(Math.round(vatTotal))}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
              <span>Celkem k úhradě</span>
              <span className="text-brand-gold">{formatCZK(Math.round(total))}</span>
            </div>
          </div>

          {/* Notes */}
          <textarea className="input text-sm min-h-[50px]" placeholder="Poznámky na dokladu (volitelné)..."
            value={form.notes} onChange={e => set('notes', e.target.value)} />

          {/* Actions */}
          <div className="flex justify-between pt-3 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-secondary">
                {saving ? '...' : 'Uložit jako koncept'}
              </button>
              <button type="submit" disabled={saving} className="btn-primary"
                onClick={() => set('status_on_save', 'sent')}>
                <Send size={14} /> {saving ? '...' : 'Vystavit a odeslat'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
