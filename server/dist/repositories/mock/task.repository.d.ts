import type { Task } from '../../models/types.js';
import type { ITaskRepository } from '../interfaces.js';
export declare class MockTaskRepository implements ITaskRepository {
    private tasks;
    findAll(filters?: {
        projectId?: string;
        clientId?: string;
        assignedUserId?: string;
        status?: string;
    }): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    update(id: string, data: Partial<Task>): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=task.repository.d.ts.map