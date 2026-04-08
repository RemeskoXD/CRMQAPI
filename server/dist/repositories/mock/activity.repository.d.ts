import type { ActivityLogEntry } from '../../models/types.js';
export declare class MockActivityRepository {
    private log;
    findAll(filters?: {
        userId?: string;
        entityType?: string;
        limit?: number;
    }): Promise<ActivityLogEntry[]>;
    create(data: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<ActivityLogEntry>;
}
//# sourceMappingURL=activity.repository.d.ts.map