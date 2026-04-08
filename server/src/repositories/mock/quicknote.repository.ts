import { v4 as uuid } from 'uuid';
import type { QuickNote } from '../../models/types.js';

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();

const mockQuickNotes: QuickNote[] = [
  { id: 'qn1', userId: 'u1', content: 'Zavolat dodavateli vrat - urgence na p3', color: '#D4AF37', isPinned: true, createdAt: ago(2), updatedAt: ago(2) },
  { id: 'qn2', userId: 'u1', content: 'Připravit podklady pro schůzku s Rezidencí Karlín', color: '#4A90D9', isPinned: false, createdAt: ago(5), updatedAt: ago(5) },
  { id: 'qn3', userId: 'u3', content: 'Klient Novotný - preference eurookna dub', color: '#2ECC71', isPinned: true, createdAt: ago(10), updatedAt: ago(10) },
];

export class MockQuickNoteRepository {
  private notes: QuickNote[] = [...mockQuickNotes];

  async findByUser(userId: string): Promise<QuickNote[]> {
    return this.notes
      .filter(n => n.userId === userId)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }

  async create(data: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickNote> {
    const note: QuickNote = { ...data, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.notes.push(note);
    return note;
  }

  async update(id: string, data: Partial<QuickNote>): Promise<QuickNote | null> {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.notes[idx] = { ...this.notes[idx], ...data, updatedAt: new Date().toISOString() };
    return this.notes[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.notes.splice(idx, 1);
    return true;
  }
}
