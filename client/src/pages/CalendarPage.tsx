import { useEffect, useState, useMemo } from 'react';
import { calendarApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, User, Trash2, Edit2 } from 'lucide-react';

const MONTH_NAMES = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
const DAY_NAMES_FULL = ['Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota','Neděle'];
const DAY_NAMES_SHORT = ['Po','Út','St','Čt','Pá','So','Ne'];
const EVENT_COLORS = [
  { value: '#D4AF37', label: 'Zlatá' },
  { value: '#3B82F6', label: 'Modrá' },
  { value: '#22C55E', label: 'Zelená' },
  { value: '#EF4444', label: 'Červená' },
  { value: '#A855F7', label: 'Fialová' },
  { value: '#F59E0B', label: 'Oranžová' },
];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function getWeekDays(baseDate: Date) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    days.push(dd);
  }
  return days;
}

function dateStr(d: Date) { return d.toISOString().slice(0, 10); }
function timeStr(iso: string) { return new Date(iso).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }); }

export default function CalendarPage() {
  const { user, hasPermission } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('week');
  const [filterUser, setFilterUser] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const year = date.getFullYear();
  const month = date.getMonth();
  const today = dateStr(new Date());

  const loadData = () => {
    const params: Record<string, string> = {};
    if (filterUser) params.userId = filterUser;
    Promise.all([
      calendarApi.list(params),
      hasPermission('users:read') ? usersApi.list().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([ev, u]) => { setEvents(ev.data); setUsers(u.data); })
      .catch(() => toast.error('Chyba načítání'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, [filterUser]);

  const getEventsForDay = (d: Date) => {
    const ds = dateStr(d);
    return events.filter(e => {
      const start = e.start.slice(0, 10);
      const end = e.end.slice(0, 10);
      return ds >= start && ds <= end;
    });
  };

  const getUserName = (uid: string) => {
    const u = users.find(u => u.id === uid);
    return u ? `${u.firstName} ${u.lastName}` : '';
  };

  const prevPeriod = () => {
    if (view === 'month') setDate(new Date(year, month - 1, 1));
    else setDate(new Date(date.getTime() - 7 * 86400000));
  };
  const nextPeriod = () => {
    if (view === 'month') setDate(new Date(year, month + 1, 1));
    else setDate(new Date(date.getTime() + 7 * 86400000));
  };
  const goToday = () => setDate(new Date());

  const openNewEvent = (day?: Date) => {
    const d = day || new Date();
    setFormDate(dateStr(d));
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditEvent = (evt: any) => {
    setEditingEvent(evt);
    setShowForm(true);
  };

  const deleteEvent = async (id: string) => {
    try {
      await calendarApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Událost smazána');
      setSelectedDay(null);
    } catch { toast.error('Chyba'); }
  };

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(date), [date]);

  const weekLabel = view === 'week'
    ? `${weekDays[0].getDate()}. ${MONTH_NAMES[weekDays[0].getMonth()].slice(0, 3)} – ${weekDays[6].getDate()}. ${MONTH_NAMES[weekDays[6].getMonth()].slice(0, 3)} ${weekDays[6].getFullYear()}`
    : `${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Kalendář</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {users.length > 0 && (
            <select className="input !py-1.5 text-sm max-w-[180px]" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <option value="">Všichni</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          )}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('week')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Týden</button>
            <button onClick={() => setView('month')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Měsíc</button>
          </div>
          {hasPermission('calendar:write') && (
            <button onClick={() => openNewEvent()} className="btn-primary text-sm !py-1.5">
              <Plus size={15} /> Nová událost
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-1">
            <button onClick={prevPeriod} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={nextPeriod} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={18} /></button>
            <button onClick={goToday} className="px-2.5 py-1 text-xs font-medium text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors ml-1">Dnes</button>
          </div>
          <h2 className="text-sm font-semibold text-gray-900">{weekLabel}</h2>
          <div className="text-xs text-gray-400">{events.length} událostí</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : view === 'week' ? (
          /* ===== WEEK VIEW ===== */
          <div className="grid grid-cols-7 min-h-[500px]">
            {weekDays.map((day, i) => {
              const ds = dateStr(day);
              const isToday = ds === today;
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay && dateStr(selectedDay) === ds;

              return (
                <div key={ds}
                  className={`border-r border-b border-gray-100 last:border-r-0 p-1.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-gold/5' : isToday ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'
                  }`}
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => hasPermission('calendar:write') && openNewEvent(day)}
                >
                  {/* Day header */}
                  <div className="text-center mb-1.5">
                    <p className="text-[10px] text-gray-400 uppercase">{DAY_NAMES_SHORT[i]}</p>
                    <p className={`text-lg font-semibold mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-brand-gold text-brand-dark' : 'text-gray-700'
                    }`}>{day.getDate()}</p>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.map(evt => (
                      <div key={evt.id}
                        onClick={e => { e.stopPropagation(); openEditEvent(evt); }}
                        className="text-[11px] px-1.5 py-1 rounded-md font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm"
                        style={{ backgroundColor: (evt.color || '#D4AF37') + '18', color: evt.color || '#D4AF37', borderLeft: `3px solid ${evt.color || '#D4AF37'}` }}
                        title={`${evt.title}${evt.allDay ? '' : ` ${timeStr(evt.start)}`}`}
                      >
                        <p className="truncate">{evt.title}</p>
                        {!evt.allDay && <p className="text-[9px] opacity-70">{timeStr(evt.start)}</p>}
                      </div>
                    ))}
                    {dayEvents.length === 0 && hasPermission('calendar:write') && (
                      <button onClick={e => { e.stopPropagation(); openNewEvent(day); }}
                        className="w-full text-[10px] text-gray-300 hover:text-brand-gold py-2 transition-colors">
                        + přidat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ===== MONTH VIEW ===== */
          <div className="grid grid-cols-7">
            {DAY_NAMES_SHORT.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-500 py-2 border-b bg-gray-50">{d}</div>
            ))}
            {monthDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/30" />;
              const ds = dateStr(day);
              const isToday = ds === today;
              const dayEvents = getEventsForDay(day);
              return (
                <div key={ds}
                  className={`min-h-[80px] border-b border-r border-gray-100 p-1 cursor-pointer transition-colors ${
                    isToday ? 'bg-brand-gold/5' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => hasPermission('calendar:write') && openNewEvent(day)}
                >
                  <p className={`text-xs font-medium mb-0.5 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-brand-gold text-brand-dark' : 'text-gray-600'
                  }`}>{day.getDate()}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(evt => (
                      <div key={evt.id} className="text-[10px] px-1 py-0.5 rounded truncate font-medium"
                        style={{ backgroundColor: (evt.color || '#D4AF37') + '18', color: evt.color || '#D4AF37' }}>
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <p className="text-[9px] text-gray-400 px-1">+{dayEvents.length - 3}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day detail sidebar */}
      {selectedDay && (
        <DayDetail
          day={selectedDay}
          events={getEventsForDay(selectedDay)}
          users={users}
          getUserName={getUserName}
          onClose={() => setSelectedDay(null)}
          onNewEvent={() => openNewEvent(selectedDay)}
          onEditEvent={openEditEvent}
          onDeleteEvent={deleteEvent}
          canEdit={hasPermission('calendar:write')}
        />
      )}

      {/* Event form */}
      {showForm && (
        <EventForm
          users={users}
          defaultDate={formDate}
          editEvent={editingEvent}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
          onSaved={() => { setShowForm(false); setEditingEvent(null); loadData(); toast.success(editingEvent ? 'Událost upravena' : 'Událost vytvořena'); }}
          onDeleted={() => { setShowForm(false); setEditingEvent(null); loadData(); toast.success('Událost smazána'); }}
        />
      )}
    </div>
  );
}

// ===== DAY DETAIL PANEL =====
function DayDetail({ day, events, users, getUserName, onClose, onNewEvent, onEditEvent, onDeleteEvent, canEdit }: any) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            {DAY_NAMES_FULL[(day.getDay() + 6) % 7]}
          </h2>
          <p className="text-xs text-gray-500">
            {day.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button onClick={onNewEvent} className="btn-primary text-xs !py-1 !px-2.5">
              <Plus size={13} /> Přidat
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((evt: any) => (
            <div key={evt.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 group hover:bg-gray-100 transition-colors"
              style={{ borderLeft: `4px solid ${evt.color || '#D4AF37'}` }}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{evt.title}</p>
                {evt.description && <p className="text-xs text-gray-500 mt-0.5">{evt.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                  {evt.userId && users.length > 0 && (
                    <span className="flex items-center gap-1"><User size={10} />{getUserName(evt.userId)}</span>
                  )}
                  {evt.allDay ? (
                    <span className="flex items-center gap-1"><Clock size={10} />Celý den</span>
                  ) : (
                    <span className="flex items-center gap-1"><Clock size={10} />{timeStr(evt.start)} – {timeStr(evt.end)}</span>
                  )}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditEvent(evt)} className="p-1 rounded hover:bg-white text-gray-400 hover:text-brand-gold"><Edit2 size={13} /></button>
                  <button onClick={() => onDeleteEvent(evt.id)} className="p-1 rounded hover:bg-white text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-6">Žádné události</p>
      )}
    </div>
  );
}

// ===== EVENT FORM (create + edit) =====
function EventForm({ users, defaultDate, editEvent, onClose, onSaved, onDeleted }: any) {
  const { user } = useAuth();
  const toast = useToast();
  const isEdit = !!editEvent;

  const [form, setForm] = useState({
    title: editEvent?.title || '',
    description: editEvent?.description || '',
    userId: editEvent?.userId || user?.id || '',
    allDay: editEvent?.allDay ?? true,
    start: editEvent ? (editEvent.allDay ? editEvent.start.slice(0, 10) : editEvent.start.slice(0, 16)) : defaultDate,
    end: editEvent ? (editEvent.allDay ? editEvent.end.slice(0, 10) : editEvent.end.slice(0, 16)) : defaultDate,
    color: editEvent?.color || '#D4AF37',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.warning('Vyplňte název'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        start: form.allDay ? form.start : new Date(form.start).toISOString(),
        end: form.allDay ? (form.end || form.start) : new Date(form.end || form.start).toISOString(),
      };
      if (isEdit) {
        await calendarApi.update(editEvent.id, payload);
      } else {
        await calendarApi.create(payload);
      }
      onSaved();
    } catch { toast.error('Chyba'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    try {
      await calendarApi.delete(editEvent.id);
      onDeleted();
    } catch { toast.error('Chyba'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">{isEdit ? 'Upravit událost' : 'Nová událost'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input className="input text-base" placeholder="Název události *" required value={form.title}
            onChange={e => set('title', e.target.value)} autoFocus />
          <textarea className="input min-h-[50px] text-sm" placeholder="Popis (volitelné)"
            value={form.description} onChange={e => set('description', e.target.value)} />

          {users.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Přiřazeno</label>
              <select className="input text-sm" value={form.userId} onChange={e => set('userId', e.target.value)}>
                <option value="">— vybrat —</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.allDay} onChange={e => set('allDay', e.target.checked)} className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
            <span className="text-sm text-gray-700">Celodenní</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Začátek</label>
              <input type={form.allDay ? 'date' : 'datetime-local'} className="input text-sm" required
                value={form.start} onChange={e => set('start', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Konec</label>
              <input type={form.allDay ? 'date' : 'datetime-local'} className="input text-sm"
                value={form.end} onChange={e => set('end', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Barva</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => set('color', c.value)}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }} title={c.label} />
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t">
            {isEdit ? (
              <button type="button" onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                <Trash2 size={14} /> Smazat
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary text-sm">Zrušit</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? '...' : isEdit ? 'Uložit změny' : 'Vytvořit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
