import type { Note } from '../../models/types.js';
export declare class MockNoteRepository {
    private notes;
    findByEntity(entityType: string, entityId: string): Promise<Note[]>;
    create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
    update(id: string, data: Partial<Note>): Promise<Note | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=notes.repository.d.ts.map