import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import {
  ArrowLeft, Building2, User, Mail, Phone, MapPin, FileText,
  FolderKanban, ClipboardList, Clock, Plus, ChevronRight,
} from 'lucide-react';
import NotesPanel from '../components/NotesPanel';

const STATUS_LABELS: Record<string, string> = {
  new_inquiry: 'Nová poptávka', site_visit: 'Obhlídka', pricing: 'Nacenění',
  waiting_material: 'Čeká na materiál', in_progress: 'Realizace', done: 'Hotovo', invoiced: 'Fakturováno',
};

const STATUS_COLORS: Record<string, string> = {
  new_inquiry: 'bg-gray-100 text-gray-700', site_visit: 'bg-blue-50 text-blue-700',
  pricing: 'bg-yellow-50 text-yellow-700', waiting_material: 'bg-orange-50 text-orange-700',
  in_progress: 'bg-indigo-50 text-indigo-700', done: 'bg-green-50 text-green-700',
  invoiced: 'bg-emerald-50 text-emerald-700',
};

const INVOICE_TYPE_LABELS: Record<string, string> = {
  quote: 'Cenová nabídka', advance: 'Záloha', invoice: 'Faktura',
};

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    clientsApi.get(id)
      .then(res => setClient(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return <p className="text-gray-500">Klient nenalezen.</p>;

  const name = client.type === 'company' ? client.companyName : `${client.firstName} ${client.lastName}`;

  return (
    <div className="space-y-6">
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-gold transition-colors">
        <ArrowLeft size={16} /> Zpět na adresář
      </Link>

      <div className="card !p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            client.type === 'company' ? 'bg-blue-50' : 'bg-purple-50'
          }`}>
            {client.type === 'company'
              ? <Building2 size={24} className="text-blue-600" />
              : <User size={24} className="text-purple-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              {client.ico && <span className="text-gray-500">IČO: {client.ico}</span>}
              {client.dic && <span className="text-gray-500">DIČ: {client.dic}</span>}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-gray-700 hover:text-brand-gold font-medium bg-gray-50 px-2.5 py-1 rounded-lg transition-colors">
                  <Phone size={13} className="text-green-500" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-gray-700 hover:text-brand-gold bg-gray-50 px-2.5 py-1 rounded-lg transition-colors">
                  <Mail size={13} className="text-blue-500" /> {client.email}
                </a>
              )}
              {client.billingCity && (
                <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                  <MapPin size={13} className="text-gray-400" /> {client.billingStreet}, {client.billingCity} {client.billingZip}
                </span>
              )}
            </div>
          </div>
          <Link to={`/kanban?new=true&clientId=${id}`} className="btn-primary text-sm flex-shrink-0">
            <Plus size={15} /> Nová zakázka
          </Link>
        </div>
        {client.marketingSource && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Zdroj: <span className="font-medium text-gray-700">{client.marketingSource}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations */}
        {client.locations?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-brand-gold" /> Místa realizace
            </h2>
            <div className="space-y-3">
              {client.locations.map((loc: any) => (
                <div key={loc.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{loc.label}</p>
                  <p className="text-sm text-gray-500">{loc.street}, {loc.city} {loc.zip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-brand-gold" /> Zakázky ({client.projects?.length || 0})
          </h2>
          <div className="space-y-3">
            {(client.projects || []).map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 transition-colors group">
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-brand-gold transition-colors">{p.title}</p>
                  {p.totalPrice && <p className="text-xs text-gray-500">{formatCZK(p.totalPrice)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-[10px] ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-gold" />
                </div>
              </Link>
            ))}
            {(!client.projects || client.projects.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Žádné zakázky</p>
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-brand-gold" /> Doklady ({client.invoices?.length || 0})
          </h2>
          <div className="space-y-3">
            {(client.invoices || []).map((inv: any) => (
              <div key={inv.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{INVOICE_TYPE_LABELS[inv.type]}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCZK(inv.total)}</p>
                  <span className={`badge ${inv.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {(!client.invoices || client.invoices.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Žádné doklady</p>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-brand-gold" /> Úkoly ({client.tasks?.length || 0})
          </h2>
          <div className="space-y-3">
            {(client.tasks || []).map((t: any) => (
              <div key={t.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <p className="font-medium text-gray-800">{t.title}</p>
                <div className="flex items-center gap-2">
                  {t.dueDate && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {new Date(t.dueDate).toLocaleDateString('cs-CZ')}
                    </span>
                  )}
                  <span className={`badge ${t.status === 'done' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {(!client.tasks || client.tasks.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Žádné úkoly</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <NotesPanel entityType="client" entityId={id!} />
    </div>
  );
}
