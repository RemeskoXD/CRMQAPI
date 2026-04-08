import type { Project } from '../../models/types.js';
import type { IProjectRepository } from '../interfaces.js';
export declare class MockProjectRepository implements IProjectRepository {
    private projects;
    findAll(filters?: {
        status?: string;
        type?: string;
        clientId?: string;
        assignedSalesId?: string;
        assignedTechnicianId?: string;
    }): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    update(id: string, data: Partial<Project>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=project.repository.d.ts.map