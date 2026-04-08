import { useEffect, useState } from 'react';
import { notesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MessageSquare, Pin, Send, Trash2, User } from 'lucide-react';

interface NotesPanelProps {
  entityType: 'client' | 'project' | 'task' | 'invoice';
  entityId: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'právě teď';
  if (mins < 60) return `před ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours}h`;
  const days = Math.floor(hours / 24);
  return `před ${days}d`;
}

export default function NotesPanel({ entityType, entityId }: NotesPanelProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [notes, setNotes] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    notesApi.list(entityType, entityId)
      .then(res => setNotes(res.data))
      .catch(console.error);
  };

  useEffect(() => { load(); }, [entityType, entityId]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await notesApi.create({ entityType, entityId, content: content.trim() });
      setContent('');
      load();
    } catch {
      toast.error('Nepodařilo se přidat poznámku');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notesApi.delete(id);
      load();
    } catch {
      toast.error('Nepodařilo se smazat');
    }
  };

  const handlePin = async (note: any) => {
    try {
      await notesApi.update(note.id, { isPinned: !note.isPinned });
      load();
    } catch {
      toast.error('Nepodařilo se připnout');
    }
  };

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-brand-gold" />
        Poznámky a komunikace ({notes.length})
      </h2>

      {/* New note input */}
      <div className="flex gap-2 mb-4">
        <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-brand-gold text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            className="input min-h-[60px] text-sm"
            placeholder="Přidat poznámku nebo interní komentář..."
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSend(); }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">Ctrl+Enter pro odeslání</span>
            <button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              className="btn-primary !py-1.5 !px-3 text-sm"
            >
              <Send size={14} /> {sending ? 'Odesílám...' : 'Přidat'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map(note => (
          <div key={note.id} className={`p-3 rounded-lg border ${note.isPinned ? 'bg-brand-gold/5 border-brand-gold/20' : 'bg-gray-50 border-transparent'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">{note.userName}</span>
                <span className="text-xs text-gray-400">{timeAgo(note.createdAt)}</span>
                {note.isPinned && <Pin size={12} className="text-brand-gold" />}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePin(note)}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${note.isPinned ? 'text-brand-gold' : 'text-gray-400'}`}
                  title={note.isPinned ? 'Odepnout' : 'Připnout'}
                >
                  <Pin size={12} />
                </button>
                {note.userId === user?.id && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}

        {notes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Zatím žádné poznámky</p>
        )}
      </div>
    </div>
  );
}
