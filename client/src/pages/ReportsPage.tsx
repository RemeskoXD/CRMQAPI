import { useEffect, useState } from 'react';
import { reportsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  TrendingUp, TrendingDown, Users, FolderKanban, FileText,
  Download, Package, ClipboardList, Target, DollarSign,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, AlertTriangle,
} from 'lucide-react';

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

const STATUS_LABELS: Record<string, string> = {
  new_inquiry: 'Poptávka', site_visit: 'Obhlídka', pricing: 'Nacenění',
  waiting_material: 'Materiál', in_progress: 'Montáž', done: 'Hotovo', invoiced: 'Fakturováno',
};
const TYPE_LABELS: Record<string, string> = { garage_doors: 'Garážová vrata', windows: 'Okna', shading: 'Stínění' };
const TYPE_COLORS: Record<string, string> = { garage_doors: '#3B82F6', windows: '#22C55E', shading: '#A855F7' };

export default function ReportsPage() {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketing' | 'finance' | 'operations'>('overview');
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    reportsApi.overview()
      .then(res => setData(res.data))
      .catch(() => toast.error('Nepodařilo se načíst reporty'))
      .finally(() => setLoading(false));
  }, []);

  const doExport = (entity: string, format: string) => {
    const token = localStorage.getItem('crmq_token');
    const url = reportsApi.exportUrl(entity, format);
    window.open(`${url}&token=${token}`, '_blank');
    toast.success(`Export ${entity} (${format.toUpperCase()}) zahájen`);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-gray-500">Nepodařilo se načíst data.</p>;

  const { kpi, charts, tables } = data;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reporty a Analytika</h1>
          <p className="text-xs text-gray-500 mt-0.5">Data v reálném čase z celého systému</p>
        </div>
        <div className="relative">
          <button onClick={() => setExportOpen(!exportOpen)} className="btn-primary text-sm !py-1.5">
            <Download size={15} /> Exportovat data
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setExportOpen(false)} />
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border py-2 min-w-[280px] z-40 animate-fade-in">
                <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vyberte data a formát</p>
                {[
                  { entity: 'clients', label: 'Klienti', icon: Users },
                  { entity: 'projects', label: 'Zakázky', icon: FolderKanban },
                  { entity: 'invoices', label: 'Faktury', icon: FileText },
                  { entity: 'tasks', label: 'Úkoly', icon: ClipboardList },
                  { entity: 'inventory', label: 'Sklad', icon: Package },
                ].map(item => (
                  <div key={item.entity} className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <item.icon size={14} className="text-gray-400" /> {item.label}
                    </span>
                    <div className="flex gap-1">
                      {['csv', 'html', 'xml'].map(fmt => (
                        <button key={fmt} onClick={() => { doExport(item.entity, fmt); setExportOpen(false); }}
                          className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-gray-100 text-gray-600 hover:bg-brand-gold hover:text-brand-dark transition-colors">
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
        {[
          { id: 'overview', label: 'Přehled' },
          { id: 'marketing', label: 'Marketing' },
          { id: 'finance', label: 'Finance' },
          { id: 'operations', label: 'Provoz' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab kpi={kpi} charts={charts} tables={tables} />}
      {activeTab === 'marketing' && <MarketingTab charts={charts} kpi={kpi} />}
      {activeTab === 'finance' && <FinanceTab kpi={kpi} charts={charts} tables={tables} />}
      {activeTab === 'operations' && <OperationsTab kpi={kpi} charts={charts} tables={tables} />}
    </div>
  );
}

// ===== OVERVIEW =====
function OverviewTab({ kpi, charts, tables }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Tržby (zaplaceno)" value={formatCZK(kpi.totalRevenue)} color="text-green-600" bg="bg-green-50" />
        <KpiCard icon={TrendingUp} label="Zisk" value={formatCZK(kpi.profit)} color={kpi.profit >= 0 ? 'text-green-600' : 'text-red-600'} bg={kpi.profit >= 0 ? 'bg-green-50' : 'bg-red-50'} />
        <KpiCard icon={Target} label="Konverze" value={`${kpi.conversionRate}%`} sub={`${kpi.totalProjects} poptávek`} color="text-brand-gold" bg="bg-amber-50" />
        <KpiCard icon={FolderKanban} label="Ø Hodnota zakázky" value={formatCZK(kpi.avgProjectValue)} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarChartCard title="Zakázky dle stavu" data={charts.projectsByStatus} labels={STATUS_LABELS} color="#D4AF37" />
        <BarChartCard title="Tržby dle typu služby" data={charts.revenueByType} labels={TYPE_LABELS} color="#3B82F6" isCurrency />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Top klienti dle tržeb</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Klient</th>
                <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">Zakázek</th>
                <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">Tržby</th>
                <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase w-32">Podíl</th>
              </tr>
            </thead>
            <tbody>
              {(tables.topClients || []).filter((c: any) => c.revenue > 0).map((client: any, idx: number) => {
                const maxRev = tables.topClients[0]?.revenue || 1;
                return (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">{idx + 1}</td>
                    <td className="py-2 font-medium text-gray-800">{client.name}</td>
                    <td className="py-2 text-right text-gray-600">{client.projects}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">{formatCZK(client.revenue)}</td>
                    <td className="py-2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-brand-gold h-2 rounded-full transition-all" style={{ width: `${(client.revenue / maxRev) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== MARKETING =====
function MarketingTab({ charts, kpi }: any) {
  const sourceEntries = Object.entries(charts.clientsBySource || {}).sort((a: any, b: any) => b[1] - a[1]);
  const revenueEntries = Object.entries(charts.revenueBySource || {}).sort((a: any, b: any) => (b[1] as number) - (a[1] as number));
  const totalClients = sourceEntries.reduce((s, [, v]) => s + (v as number), 0);
  const totalRevBySrc = revenueEntries.reduce((s, [, v]) => s + (v as number), 0);
  const SRC_COLORS = ['#D4AF37', '#3B82F6', '#22C55E', '#A855F7', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard icon={Users} label="Celkem klientů" value={kpi.totalClients} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={Target} label="Konverzní poměr" value={`${kpi.conversionRate}%`} sub="poptávka → realizace" color="text-brand-gold" bg="bg-amber-50" />
        <KpiCard icon={TrendingUp} label="Ø hodnota zakázky" value={formatCZK(kpi.avgProjectValue)} color="text-green-600" bg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-brand-gold" /> Zdroje klientů
          </h3>
          <div className="space-y-3">
            {sourceEntries.map(([source, count], idx) => (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{source}</span>
                  <span className="text-sm font-semibold text-gray-900">{count as number} <span className="text-gray-400 font-normal">({Math.round(((count as number) / totalClients) * 100)}%)</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${((count as number) / totalClients) * 100}%`, backgroundColor: SRC_COLORS[idx % SRC_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by source */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-gold" /> Tržby dle zdroje (ROI)
          </h3>
          <div className="space-y-3">
            {revenueEntries.map(([source, revenue], idx) => (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{source}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCZK(revenue as number)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${totalRevBySrc > 0 ? ((revenue as number) / totalRevBySrc) * 100 : 0}%`, backgroundColor: SRC_COLORS[idx % SRC_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project types distribution */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Zakázky dle typu služby</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(charts.projectsByType || {}).map(([type, count]) => {
            const revenue = charts.revenueByType?.[type] || 0;
            return (
              <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: TYPE_COLORS[type] + '20' }}>
                  <span className="text-lg font-bold" style={{ color: TYPE_COLORS[type] }}>{count as number}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{TYPE_LABELS[type]}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatCZK(revenue as number)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== FINANCE =====
function FinanceTab({ kpi, charts, tables }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp} label="Tržby" value={formatCZK(kpi.totalRevenue)} color="text-green-600" bg="bg-green-50" />
        <KpiCard icon={TrendingDown} label="Náklady" value={formatCZK(kpi.paidExpenses)} color="text-red-600" bg="bg-red-50" />
        <KpiCard icon={DollarSign} label="Zisk" value={formatCZK(kpi.profit)} color="text-brand-gold" bg="bg-amber-50" />
        <KpiCard icon={Package} label="Hodnota skladu" value={formatCZK(kpi.inventoryValue)} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Pohledávky</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-yellow-800">Čeká na platbu</span>
              <span className="text-lg font-bold text-yellow-700">{formatCZK(kpi.pendingRevenue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-red-800 flex items-center gap-1"><AlertTriangle size={14} /> Po splatnosti</span>
              <span className="text-lg font-bold text-red-700">{formatCZK(kpi.overdueRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Doklady dle typu</h3>
          <div className="space-y-2">
            {Object.entries(charts.invoicesByType || {}).map(([type, val]: any) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{TYPE_LABELS[type] || type === 'quote' ? 'Cenové nabídky' : type === 'advance' ? 'Zálohy' : 'Faktury'}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCZK(val.total)}</span>
                  <span className="text-xs text-gray-400 ml-2">({val.count}×)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tables.overdueInvoices?.length > 0 && (
        <div className="card border-red-100">
          <h3 className="font-semibold text-red-700 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Faktury po splatnosti
          </h3>
          <div className="space-y-2">
            {tables.overdueInvoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">Splatnost: {new Date(inv.dueDate).toLocaleDateString('cs-CZ')}</p>
                </div>
                <span className="text-sm font-bold text-red-700">{formatCZK(inv.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== OPERATIONS =====
function OperationsTab({ kpi, charts, tables }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={FolderKanban} label="Aktivní zakázky" value={kpi.activeProjects} color="text-brand-gold" bg="bg-amber-50" />
        <KpiCard icon={ClipboardList} label="Otevřené úkoly" value={kpi.tasksOpen} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={AlertTriangle} label="Zpožděné úkoly" value={kpi.tasksOverdue} color="text-red-600" bg="bg-red-50" />
        <KpiCard icon={Package} label="Nízký sklad" value={`${kpi.lowStockCount} položek`} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <BarChartCard title="Zakázky dle stavu (pipeline)" data={charts.projectsByStatus} labels={STATUS_LABELS} color="#D4AF37" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Efektivita úkolů</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{kpi.tasksDone}</p>
              <p className="text-xs text-green-700 mt-1">Dokončeno</p>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{kpi.tasksOpen}</p>
              <p className="text-xs text-blue-700 mt-1">Otevřeno</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{kpi.tasksOverdue}</p>
              <p className="text-xs text-red-700 mt-1">Zpožděno</p>
            </div>
          </div>
          {kpi.tasksOpen + kpi.tasksDone > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Míra dokončení</span>
                <span>{Math.round((kpi.tasksDone / (kpi.tasksOpen + kpi.tasksDone)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(kpi.tasksDone / (kpi.tasksOpen + kpi.tasksDone)) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {tables.lowStockItems?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Package size={16} className="text-orange-500" /> Nízký stav skladu
            </h3>
            <div className="space-y-2">
              {tables.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-700">{item.stockQuantity} {item.unit}</p>
                    <p className="text-[10px] text-gray-400">min: {item.minStockLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== SHARED COMPONENTS =====
function KpiCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: any; sub?: string; color: string; bg: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">{label}</span>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChartCard({ title, data, labels, color, isCurrency }: {
  title: string; data: Record<string, number>; labels: Record<string, string>; color: string; isCurrency?: boolean;
}) {
  const entries = Object.entries(data || {});
  const maxVal = Math.max(...entries.map(([, v]) => v as number), 1);

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-brand-gold" /> {title}
      </h3>
      <div className="space-y-2.5">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">{labels[key] || key}</span>
              <span className="text-xs font-semibold text-gray-900">
                {isCurrency ? formatCZK(value as number) : value}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div className="h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.max((value as number) / maxVal * 100, 2)}%`, backgroundColor: color }}>
                {(value as number) / maxVal > 0.15 && (
                  <span className="text-[9px] font-bold text-white">{isCurrency ? '' : value}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
