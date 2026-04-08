import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, FolderKanban, ClipboardList,
  CalendarDays, FileText, Package, LogOut, Menu, X, User,
  Shield, Search, Bell, Plus, ChevronDown, Settings,
  Receipt, BarChart3, Wrench,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ROLE_LABELS: Record<string, string> = {
  root: 'Administrátor', admin: 'Admin',
  team_leader: 'Team Leader', sales_rep: 'Obchodní zástupce',
  technician: 'Technik', analyst: 'Analytik',
  infoline: 'Infolinka', accountant: 'Účetní',
};

export default function Layout() {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setQuickActionsOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickActionsOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  const mainNav = [
    { to: '/', icon: LayoutDashboard, label: 'Nástěnka', show: true },
    { to: '/clients', icon: Users, label: 'Klienti', show: hasPermission('clients:read') },
    { to: '/kanban', icon: FolderKanban, label: 'Realizace', show: hasPermission('projects:read') || hasPermission('projects:read_assigned') },
    { to: '/tasks', icon: ClipboardList, label: 'Úkoly', show: hasPermission('tasks:read') || hasPermission('tasks:update_own') },
    { to: '/calendar', icon: CalendarDays, label: 'Kalendář', show: hasPermission('calendar:read') || hasPermission('calendar:read_own') },
    { to: '/invoices', icon: FileText, label: 'Ekonomika', show: hasPermission('invoices:read') },
    { to: '/reports', icon: BarChart3, label: 'Reporty', show: hasPermission('reports:read') || hasRole('root', 'admin', 'analyst') },
  ].filter(i => i.show);

  const moreNav = [
    { to: '/leads', icon: Users, label: 'Leady', show: hasRole('root', 'admin', 'infoline', 'sales_rep') },
    { to: '/inventory', icon: Package, label: 'Sklad', show: hasPermission('inventory:read') },
    { to: '/received-invoices', icon: Receipt, label: 'Přijaté faktury', show: hasPermission('invoices:read') },
    { to: '/apps', icon: Settings, label: 'Aplikace', show: true },
    { to: '/users', icon: Shield, label: 'Uživatelé', show: hasRole('root', 'admin', 'team_leader') },
  ].filter(i => i.show);

  const quickActions = [
    { label: 'Nová poptávka', icon: Plus, action: () => navigate('/kanban?new=true'), show: hasPermission('projects:write') || hasPermission('projects:create') },
    { label: 'Nový klient', icon: Users, action: () => navigate('/clients?new=true'), show: hasPermission('clients:write') },
    { label: 'Nový úkol', icon: ClipboardList, action: () => navigate('/tasks?new=true'), show: hasPermission('tasks:write') },
  ].filter(i => i.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-brand-dark sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-6">
              <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                  <span className="text-brand-dark font-bold text-xs">CQ</span>
                </div>
                <span className="text-white font-semibold hidden sm:block">CRMQ</span>
              </NavLink>

              <nav className="hidden lg:flex items-center gap-0.5">
                {mainNav.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 ${
                        isActive
                          ? 'bg-brand-gold/15 text-brand-gold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                {/* More menu */}
                {moreNav.length > 0 && (
                  <div className="relative" ref={moreRef}>
                    <button
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                        moreMenuOpen ? 'text-brand-gold bg-brand-gold/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Více <ChevronDown size={14} className={`transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {moreMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border py-1 min-w-[200px] z-50">
                        {moreNav.map(item => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                isActive ? 'text-brand-gold bg-brand-gold/5 font-medium' : 'text-gray-700 hover:bg-gray-50'
                              }`
                            }
                          >
                            <item.icon size={16} />
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </nav>
            </div>

            {/* Right: Search + Quick Actions + User */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-sm transition-colors"
              >
                <Search size={15} />
                <span className="hidden md:inline">Hledat...</span>
                <kbd className="hidden md:inline text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-500">Ctrl+K</kbd>
              </button>

              {/* Quick add button */}
              {quickActions.length > 0 && (
                <div className="relative" ref={quickRef}>
                  <button
                    onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                    className="flex items-center justify-center w-8 h-8 bg-brand-gold text-brand-dark rounded-lg hover:bg-brand-gold-light transition-colors"
                    title="Rychlé akce"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                  {quickActionsOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border py-1 min-w-[200px] z-50">
                      <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rychlé akce</p>
                      {quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={qa.action}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <qa.icon size={16} className="text-brand-gold" />
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User info - clickable to profile */}
              <NavLink to="/profile" className="hidden sm:flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-white text-xs font-medium leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-500 text-[10px]">{ROLE_LABELS[user?.role || '']}</p>
                </div>
                <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-gold text-xs font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Odhlásit se"
              >
                <LogOut size={16} />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-400 hover:text-white p-1.5"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 pb-4 px-4 pt-3 space-y-1">
            {[...mainNav, ...moreNav].map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-gold/15 text-brand-gold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/10 mt-2">
              <div className="flex items-center gap-3 px-3 py-2 text-gray-400">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-gold text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-500 text-xs">{ROLE_LABELS[user?.role || '']}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:text-red-300 rounded-lg hover:bg-white/5 text-sm font-medium"
              >
                <LogOut size={18} /> Odhlásit se
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b">
              <Search size={20} className="text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-lg outline-none placeholder:text-gray-300"
                placeholder="Hledat klienta, zakázku, úkol..."
              />
              <kbd className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-400">Esc</kbd>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {searchQuery.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rychlé výsledky</p>
                  <button
                    onClick={() => { navigate(`/clients?search=${searchQuery}`); setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Users size={16} className="text-blue-500" />
                    <span className="text-sm">Hledat "<strong>{searchQuery}</strong>" v klientech</span>
                  </button>
                  <button
                    onClick={() => { navigate(`/kanban?search=${searchQuery}`); setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <FolderKanban size={16} className="text-brand-gold" />
                    <span className="text-sm">Hledat "<strong>{searchQuery}</strong>" v zakázkách</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Začněte psát pro vyhledávání</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        <Outlet />
      </main>
    </div>
  );
}
