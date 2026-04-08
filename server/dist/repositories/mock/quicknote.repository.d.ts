import type { QuickNote } from '../../models/types.js';
export declare class MockQuickNoteRepository {
    private notes;
    findByUser(userId: string): Promise<QuickNote[]>;
    create(data: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickNote>;
    update(id: string, data: Partial<QuickNote>): Promise<QuickNote | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=quicknote.repository.d.ts.map