import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dashboardApi, tasksApi, quickNotesApi } from '../services/api';
import {
  Users, FolderKanban, ClipboardList, TrendingUp,
  FileText, AlertTriangle, Clock, CheckCircle2, ArrowRight,
  Circle, MessageSquare, ChevronDown, Plus, X, Pin,
  StickyNote, Activity, MapPin, Phone, Package,
  Wrench, Eye, CalendarDays, Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, string> = {
  new_inquiry: 'Nová poptávka', site_visit: 'Obhlídka', pricing: 'Nacenění',
  waiting_material: 'Čeká na materiál', in_progress: 'Realizace', done: 'Hotovo', invoiced: 'Fakturováno',
};
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50', high: 'text-orange-600 bg-orange-50',
  medium: 'text-blue-600 bg-blue-50', low: 'text-gray-600 bg-gray-50',
};
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgentní', high: 'Vysoká', medium: 'Střední', low: 'Nízká',
};

function formatCZK(amount: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'právě teď';
  if (mins < 60) return `před ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours}h`;
  return `před ${Math.floor(hours / 24)}d`;
}

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    dashboardApi.get()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Nepodařilo se načíst dashboard'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!stats) return <p className="text-gray-500">Nepodařilo se načíst data.</p>;

  const role = user?.role;
  const isTech = role === 'technician';

  if (isTech) return <TechDashboard stats={stats} userName={user?.firstName || ''} onUpdate={loadData} />;

  return (
    <div className="space-y-6">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.firstName}
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('projects:write') && (
            <button onClick={() => navigate('/kanban?new=true')} className="btn-primary text-sm">
              <Plus size={16} /> Nová poptávka
            </button>
          )}
          {hasPermission('clients:write') && (
            <button onClick={() => navigate('/clients?new=true')} className="btn-secondary text-sm">
              <Users size={16} /> Nový klient
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {(role === 'root' || role === 'admin' || role === 'team_leader' || role === 'analyst') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatLink to="/clients" icon={Users} label="Klienti" value={stats.totalClients} color="text-blue-600" bg="bg-blue-50" />
          <StatLink to="/kanban" icon={FolderKanban} label="Aktivní zakázky" value={stats.activeProjects} color="text-brand-gold" bg="bg-amber-50" />
          <StatLink to="/invoices" icon={TrendingUp} label="Příjmy" value={formatCZK(stats.totalRevenue || 0)} color="text-green-600" bg="bg-green-50" />
          <StatLink to="/tasks" icon={ClipboardList} label="Otevřené úkoly" value={stats.openTasks} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {role === 'sales_rep' && (
        <div className="grid grid-cols-3 gap-3">
          <StatLink to="/kanban" icon={FolderKanban} label="Moje zakázky" value={stats.myProjects} color="text-brand-gold" bg="bg-amber-50" />
          <StatLink to="/kanban" icon={Wrench} label="Aktivní" value={stats.myActiveProjects} color="text-blue-600" bg="bg-blue-50" />
          <StatLink to="/tasks" icon={ClipboardList} label="Moje úkoly" value={stats.myOpenTasks} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {role === 'accountant' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatLink to="/invoices" icon={FileText} label="Dokladů" value={stats.totalInvoices} color="text-blue-600" bg="bg-blue-50" />
          <StatLink to="/invoices" icon={TrendingUp} label="Zaplaceno" value={formatCZK(stats.paidTotal || 0)} color="text-green-600" bg="bg-green-50" />
          <StatLink to="/invoices" icon={Clock} label="Čeká" value={formatCZK(stats.pendingTotal || 0)} color="text-yellow-600" bg="bg-yellow-50" />
          <StatLink to="/invoices" icon={AlertTriangle} label="Po splatnosti" value={formatCZK(stats.overdueTotal || 0)} color="text-red-600" bg="bg-red-50" />
        </div>
      )}

      {role === 'infoline' && (
        <div className="grid grid-cols-3 gap-3">
          <StatLink to="/clients" icon={Users} label="Klienti" value={stats.totalClients} color="text-blue-600" bg="bg-blue-50" />
          <StatLink to="/kanban" icon={FolderKanban} label="Nové poptávky" value={stats.newInquiries} color="text-brand-gold" bg="bg-amber-50" />
          <StatLink to="/tasks" icon={ClipboardList} label="Otevřené úkoly" value={stats.openTasks} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Tasks + Kanban overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* My upcoming tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList size={18} className="text-brand-gold" /> Moje úkoly
              </h2>
              <Link to="/tasks" className="text-sm text-brand-gold hover:text-brand-gold-dark flex items-center gap-1">
                Všechny <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {(stats.upcomingTasks || []).slice(0, 6).map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => task.projectId && navigate(`/projects/${task.projectId}`)}>
                  <span className={`badge text-xs ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                  <span className="text-sm font-medium text-gray-800 flex-1 truncate group-hover:text-brand-gold transition-colors">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Clock size={11} /> {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              ))}
              {(!stats.upcomingTasks || stats.upcomingTasks.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">Žádné nadcházející úkoly</p>
              )}
            </div>
          </div>

          {/* Kanban mini overview for admin/team leader */}
          {(role === 'root' || role === 'admin' || role === 'team_leader' || role === 'analyst') && stats.projectsByStatus && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FolderKanban size={18} className="text-brand-gold" /> Průběh zakázek
                </h2>
                <Link to="/kanban" className="text-sm text-brand-gold hover:text-brand-gold-dark flex items-center gap-1">
                  Kanban <ArrowRight size={14} />
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.entries(stats.projectsByStatus).map(([key, count]) => (
                  <Link
                    key={key}
                    to={`/kanban?status=${key}`}
                    className="flex-1 min-w-[100px] bg-gray-50 hover:bg-brand-gold/5 rounded-xl p-3 text-center transition-colors group"
                  >
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-brand-gold transition-colors">{count as number}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{STATUS_LABELS[key]}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-brand-gold" /> Poslední aktivita
            </h2>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {(stats.activityFeed || []).map((entry: any) => (
                <div key={entry.id} className="flex items-start gap-3 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${ACTION_COLORS[entry.action]}`}>
                    {entry.userName?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{entry.userName}</span>
                      {' '}{ACTION_LABELS[entry.action]}{' '}
                      {entry.entityTitle && <span className="font-medium text-gray-900">"{entry.entityTitle}"</span>}
                    </p>
                    {entry.details && <p className="text-xs text-gray-500">{entry.details}</p>}
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!stats.activityFeed || stats.activityFeed.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Žádná nedávná aktivita</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Quick Notes + useful shortcuts */}
        <div className="space-y-6">
          {/* Quick notes */}
          <QuickNotesWidget notes={stats.quickNotes || []} onUpdate={loadData} />

          {/* Quick links by role */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={18} className="text-brand-gold" /> Zkratky
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {hasPermission('clients:read') && (
                <Link to="/clients" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 text-sm font-medium text-gray-700 hover:text-brand-gold transition-colors">
                  <Users size={16} /> Klienti
                </Link>
              )}
              {hasPermission('calendar:read') && (
                <Link to="/calendar" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 text-sm font-medium text-gray-700 hover:text-brand-gold transition-colors">
                  <CalendarDays size={16} /> Kalendář
                </Link>
              )}
              {hasPermission('invoices:read') && (
                <Link to="/invoices" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 text-sm font-medium text-gray-700 hover:text-brand-gold transition-colors">
                  <FileText size={16} /> Faktury
                </Link>
              )}
              {hasPermission('inventory:read') && (
                <Link to="/inventory" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 text-sm font-medium text-gray-700 hover:text-brand-gold transition-colors">
                  <Package size={16} /> Sklad
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Dobré ráno';
  if (h < 18) return 'Dobrý den';
  return 'Dobrý večer';
}

// ====================== STAT CARD (clickable) ======================
function StatLink({ to, icon: Icon, label, value, color, bg }: {
  to: string; icon: any; label: string; value: any; color: string; bg: string;
}) {
  return (
    <Link to={to} className="stat-card hover:shadow-md hover:border-brand-gold/20 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 group-hover:text-brand-gold transition-colors">{label}</span>
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </Link>
  );
}

// ====================== TECHNICIAN DASHBOARD (mobile-first) ======================
function TechDashboard({ stats, userName, onUpdate }: { stats: any; userName: string; onUpdate: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const todayTasks = stats.todayTasks || [];
  const upcomingTasks = stats.upcomingTasks || [];
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    try {
      await tasksApi.update(task.id, {
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
      });
      toast.success(newStatus === 'done' ? 'Hotovo!' : 'Úkol obnoven');
      onUpdate();
    } catch { toast.error('Chyba'); }
  };

  const saveNote = async (taskId: string) => {
    const note = taskNotes[taskId];
    if (!note?.trim()) return;
    try {
      await tasksApi.update(taskId, { notes: note });
      toast.success('Poznámka uložena');
      setTaskNotes(n => ({ ...n, [taskId]: '' }));
    } catch { toast.error('Chyba'); }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Dark header */}
      <div className="bg-brand-dark -mx-4 sm:-mx-6 -mt-5 px-5 pt-5 pb-7 rounded-b-[28px]">
        <p className="text-gray-400 text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">{userName}</h1>
        <p className="text-gray-500 text-xs mt-1">
          {new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-gold">{todayTasks.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Dnes</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.completedToday || 0}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Splněno</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{upcomingTasks.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Celkem</p>
          </div>
        </div>
      </div>

      {/* Today's tasks - "Okamžitá práce" */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap size={16} className="text-brand-gold" /> Okamžitá práce
        </h2>
        <div className="space-y-3">
          {todayTasks.map((task: any) => {
            const isExpanded = expandedTask === task.id;
            return (
              <div key={task.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                task.status === 'done' ? 'border-green-200 opacity-60' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleTask(task)}
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 active:bg-brand-gold/20 active:text-brand-gold'
                    }`}>
                    {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    {task.project && <p className="text-xs text-gray-400 mt-0.5 truncate">{task.project.title}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`badge text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                    <ChevronDown size={14} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
                    {task.description && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{task.description}</p>}

                    {task.location && (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(`${task.location.street}, ${task.location.city}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl text-blue-700 text-sm font-medium active:bg-blue-100">
                        <MapPin size={18} />
                        <div>
                          <p>{task.location.street}</p>
                          <p className="text-blue-500 text-xs">{task.location.city} — navigovat</p>
                        </div>
                      </a>
                    )}

                    {task.client?.phone && (
                      <a href={`tel:${task.client.phone}`} className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl text-green-700 text-sm font-medium active:bg-green-100">
                        <Phone size={18} />
                        <div>
                          <p>{task.client.phone}</p>
                          <p className="text-green-500 text-xs">{task.client.companyName || `${task.client.firstName} ${task.client.lastName}`}</p>
                        </div>
                      </a>
                    )}

                    {task.materials?.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Materiál</p>
                        {task.materials.map((m: any) => (
                          <div key={m.id} className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-700">{m.description}</span>
                            <span className="text-gray-500 font-medium">{m.quantity} {m.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input className="input flex-1 text-sm" placeholder="Poznámka..."
                        value={taskNotes[task.id] || ''}
                        onChange={e => setTaskNotes(n => ({ ...n, [task.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveNote(task.id); }} />
                      <button onClick={() => saveNote(task.id)} className="btn-primary !px-3 !py-2 text-sm" disabled={!taskNotes[task.id]?.trim()}>
                        Uložit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {todayTasks.length === 0 && (
            <div className="text-center py-10">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-green-300" />
              <p className="font-medium text-gray-600">Na dnes nemáte práci</p>
            </div>
          )}
        </div>
      </div>

      {/* "Individuál" plan */}
      {upcomingTasks.filter((t: any) => !todayTasks.find((td: any) => td.id === t.id)).length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-gold" /> Individuál — plán
          </h2>
          <div className="space-y-2">
            {upcomingTasks.filter((t: any) => !todayTasks.find((td: any) => td.id === t.id)).map((task: any) => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-3 active:bg-gray-50"
                onClick={() => task.projectId && navigate(`/projects/${task.projectId}`)}>
                <div className="flex items-center gap-2.5">
                  <span className={`badge text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                  <p className="text-sm font-medium text-gray-800 flex-1 truncate">{task.title}</p>
                  {task.dueDate && <span className="text-[11px] text-gray-400">{formatDate(task.dueDate)}</span>}
                </div>
                {task.location && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {task.location.city} — {task.project?.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====================== SHARED ======================
const ACTION_LABELS: Record<string, string> = {
  created: 'vytvořil/a', updated: 'aktualizoval/a', deleted: 'smazal/a',
  status_changed: 'změnil/a stav', comment_added: 'přidal/a poznámku', assigned: 'přiřadil/a',
};
const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-600', updated: 'bg-blue-100 text-blue-600',
  deleted: 'bg-red-100 text-red-600', status_changed: 'bg-yellow-100 text-yellow-700',
  comment_added: 'bg-purple-100 text-purple-600', assigned: 'bg-indigo-100 text-indigo-600',
};

function QuickNotesWidget({ notes, onUpdate }: { notes: any[]; onUpdate: () => void }) {
  const toast = useToast();
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setAdding(true);
    try {
      await quickNotesApi.create({ content: newNote.trim(), color: '#D4AF37', isPinned: false });
      setNewNote('');
      onUpdate();
    } catch { toast.error('Chyba'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    try { await quickNotesApi.delete(id); onUpdate(); } catch { toast.error('Chyba'); }
  };

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <StickyNote size={18} className="text-brand-gold" /> Moje poznámky
      </h2>
      <div className="flex gap-2 mb-3">
        <input className="input flex-1 text-sm" placeholder="Nová poznámka..."
          value={newNote} onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }} />
        <button onClick={handleAdd} disabled={adding || !newNote.trim()} className="btn-primary !px-2.5 !py-2">
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
        {notes.map((note: any) => (
          <div key={note.id} className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
            style={{ borderLeft: `3px solid ${note.color}` }}>
            <p className="text-sm text-gray-700 flex-1">{note.content}</p>
            <button onClick={() => handleDelete(note.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
              <X size={12} />
            </button>
          </div>
        ))}
        {notes.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Zatím žádné poznámky</p>}
      </div>
    </div>
  );
}
