import { v4 as uuid } from 'uuid';
import type { Note } from '../../models/types.js';

const now = new Date().toISOString();
const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();

const mockNotes: Note[] = [
  { id: 'n1', entityType: 'client', entityId: 'c1', userId: 'u3', userName: 'Andrej Kováč', content: 'Klient preferuje komunikaci přes e-mail. Volat jen v urgentních případech.', isPinned: true, createdAt: ago(48), updatedAt: ago(48) },
  { id: 'n2', entityType: 'client', entityId: 'c1', userId: 'u2', userName: 'Marek Novák', content: 'Domluvena sleva 5% na další zakázku - splnění objemu za Q1.', isPinned: false, createdAt: ago(24), updatedAt: ago(24) },
  { id: 'n3', entityType: 'project', entityId: 'p1', userId: 'u4', userName: 'Petr Dvořák', content: 'Stavební připravenost OK. Přívod 230V je na místě. Otvory odpovídají výrobní dokumentaci.', isPinned: false, createdAt: ago(72), updatedAt: ago(72) },
  { id: 'n4', entityType: 'project', entityId: 'p1', userId: 'u3', userName: 'Andrej Kováč', content: 'Klient potvrdil termín montáže na příští týden. Záloha uhrazena.', isPinned: true, createdAt: ago(12), updatedAt: ago(12) },
  { id: 'n5', entityType: 'project', entityId: 'p3', userId: 'u5', userName: 'Jana Svobodová', content: 'Materiál ještě nedorazil od dodavatele. ETA: pátek.', isPinned: false, createdAt: ago(6), updatedAt: ago(6) },
  { id: 'n6', entityType: 'client', entityId: 'c3', userId: 'u3', userName: 'Andrej Kováč', content: 'Kontaktní osoba: Ing. Jaroslav Horák, tel. +420 777 888 999', isPinned: true, createdAt: ago(96), updatedAt: ago(96) },
  { id: 'n7', entityType: 'project', entityId: 'p2', userId: 'u3', userName: 'Andrej Kováč', content: 'Klient chce dřevěná eurookna v dekoru dub. Posílám specifikaci výrobci.', isPinned: false, createdAt: ago(18), updatedAt: ago(18) },
];

export class MockNoteRepository {
  private notes: Note[] = [...mockNotes];

  async findByEntity(entityType: string, entityId: string): Promise<Note[]> {
    return this.notes
      .filter(n => n.entityType === entityType && n.entityId === entityId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const note: Note = { ...data, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.notes.push(note);
    return note;
  }

  async update(id: string, data: Partial<Note>): Promise<Note | null> {
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
