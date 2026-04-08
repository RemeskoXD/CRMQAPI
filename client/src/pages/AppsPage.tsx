import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Mail, BarChart3, Search, Globe, Star, ShoppingCart,
  MonitorSmartphone, FolderOpen, FileText, Plus, X, Save,
  Trash2, ArrowLeft, Edit2, ExternalLink,
} from 'lucide-react';

type ApiRes<T> = { success: boolean; data: T };

// Admin links - external services
const ADMIN_APPS = [
  { name: 'E-mail', url: 'https://mail.google.com', icon: '📧', color: '#EA4335' },
  { name: 'Google Analytics', url: 'https://analytics.google.com', icon: '📊', color: '#F9AB00' },
  { name: 'Google Ads', url: 'https://ads.google.com', icon: '📢', color: '#4285F4' },
  { name: 'Google Search Console', url: 'https://search.google.com/search-console', icon: '🔍', color: '#4285F4' },
  { name: 'Google Profil', url: 'https://business.google.com', icon: '🏢', color: '#34A853' },
  { name: 'Microsoft Clarity', url: 'https://clarity.microsoft.com', icon: '👁️', color: '#0078D4' },
  { name: 'Bing profil', url: 'https://www.bing.com/webmasters', icon: '🅱️', color: '#008373' },
  { name: 'Seznam SKLIK', url: 'https://www.sklik.cz', icon: '🎯', color: '#CC0000' },
  { name: 'Recenze', url: 'https://www.google.com/maps', icon: '⭐', color: '#FBBC04' },
  { name: 'Náš web', url: 'https://qapi.cz', icon: '🌐', color: '#0B1126' },
  { name: 'Náš e-shop', url: 'https://qapi.cz', icon: '🛒', color: '#D4AF37' },
];

const COMMON_APPS = [
  { name: 'E-mail', url: 'https://mail.google.com', icon: '📧', color: '#EA4335' },
];

export default function AppsPage() {
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'apps' | 'desktop'>('apps');
  const [desktopItems, setDesktopItems] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const isAdmin = hasRole('root', 'admin');
  const apps = isAdmin ? ADMIN_APPS : COMMON_APPS;

  const loadDesktop = (parentId?: string) => {
    const params = parentId ? `?parentId=${parentId}` : '';
    api.get<ApiRes<any[]>>(`/desktop${params}`)
      .then(r => setDesktopItems(r.data))
      .catch(() => {});
  };
  useEffect(() => { loadDesktop(currentFolder || undefined); }, [currentFolder]);

  const createItem = async (type: 'folder' | 'file' | 'link', name?: string) => {
    try {
      const data: any = {
        type,
        name: name || (type === 'folder' ? 'Nová složka' : type === 'file' ? 'Nový soubor.txt' : 'Nový odkaz'),
        parentId: currentFolder || undefined,
      };
      if (type === 'file') data.content = '';
      if (type === 'link') data.url = 'https://';
      await api.post('/desktop', data);
      loadDesktop(currentFolder || undefined);
      setShowNewMenu(false);
      toast.success(`${type === 'folder' ? 'Složka' : 'Soubor'} vytvořen`);
    } catch { toast.error('Chyba'); }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/desktop/${id}`);
      loadDesktop(currentFolder || undefined);
      toast.success('Smazáno');
    } catch { toast.error('Chyba'); }
  };

  const saveFile = async (id: string, content: string) => {
    try {
      await api.patch(`/desktop/${id}`, { content });
      toast.success('Uloženo');
    } catch { toast.error('Chyba'); }
  };

  const openFolder = (id: string) => setCurrentFolder(id);
  const goBack = () => setCurrentFolder(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Aplikace</h1>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setTab('apps')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'apps' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            Interní aplikace
          </button>
          <button onClick={() => setTab('desktop')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            PC Plocha
          </button>
        </div>
      </div>

      {tab === 'apps' && (
        <div>
          <p className="text-xs text-gray-500 mb-4">Rychlé prokliky na často používané služby</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {apps.map((app, i) => (
              <a key={i} href={app.url} target="_blank" rel="noopener noreferrer"
                className="card !p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-brand-gold/20 transition-all group text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: app.color + '15' }}>
                  {app.icon}
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-brand-gold transition-colors">{app.name}</p>
                <ExternalLink size={10} className="text-gray-300 group-hover:text-brand-gold" />
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === 'desktop' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {currentFolder && (
                <button onClick={goBack} className="btn-secondary text-xs !py-1 !px-2">
                  <ArrowLeft size={13} /> Zpět
                </button>
              )}
              <p className="text-xs text-gray-500">
                {currentFolder ? 'Obsah složky' : 'Vaše PC plocha'} — klikněte pro otevření, dvojklik pro editaci
              </p>
            </div>
            <div className="relative">
              <button onClick={() => setShowNewMenu(!showNewMenu)} className="btn-primary text-xs !py-1 !px-2.5">
                <Plus size={13} /> Nový
              </button>
              {showNewMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNewMenu(false)} />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border py-1 min-w-[160px] z-40 animate-fade-in">
                    <button onClick={() => createItem('folder')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FolderOpen size={14} className="text-blue-500" /> Složka
                    </button>
                    <button onClick={() => createItem('file')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FileText size={14} className="text-green-500" /> Textový soubor
                    </button>
                    <button onClick={() => createItem('link')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Globe size={14} className="text-purple-500" /> Odkaz
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {desktopItems.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {desktopItems.map(item => (
                <div key={item.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors relative"
                  onClick={() => {
                    if (item.type === 'folder') openFolder(item.id);
                    else if (item.type === 'file') setEditingFile(item);
                    else if (item.type === 'link' && item.url) window.open(item.url, '_blank');
                  }}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                    item.type === 'folder' ? 'bg-blue-50' : item.type === 'file' ? 'bg-green-50' : 'bg-purple-50'
                  }`}>
                    {item.type === 'folder' ? '📁' : item.type === 'file' ? '📄' : item.icon || '🔗'}
                  </div>
                  <p className="text-[11px] text-gray-700 text-center font-medium leading-tight w-full truncate">{item.name}</p>
                  <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                    className="absolute top-1 right-1 p-0.5 rounded bg-white shadow opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <MonitorSmartphone size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Plocha je prázdná</p>
              <p className="text-xs mt-1">Klikněte na "Nový" pro vytvoření složky nebo souboru</p>
            </div>
          )}
        </div>
      )}

      {/* File editor */}
      {editingFile && (
        <FileEditor file={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={(content) => { saveFile(editingFile.id, content); setEditingFile(null); }}
          onDelete={() => { deleteItem(editingFile.id); setEditingFile(null); }} />
      )}
    </div>
  );
}

function FileEditor({ file, onClose, onSave, onDelete }: {
  file: any; onClose: () => void; onSave: (content: string) => void; onDelete: () => void;
}) {
  const [content, setContent] = useState(file.content || '');
  const [name, setName] = useState(file.name);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <input className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Smazat">
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
        </div>
        <textarea
          className="flex-1 p-4 text-sm font-mono text-gray-800 outline-none resize-none min-h-[300px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Začněte psát..."
          autoFocus
        />
        <div className="flex justify-between p-4 border-t">
          <p className="text-xs text-gray-400">{content.length} znaků</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">Zrušit</button>
            <button onClick={() => onSave(content)} className="btn-primary text-sm">
              <Save size={14} /> Uložit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
