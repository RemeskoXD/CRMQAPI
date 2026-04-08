import type { Client } from '../../models/types.js';
import type { IClientRepository } from '../interfaces.js';
export declare class MockClientRepository implements IClientRepository {
    private clients;
    findAll(filters?: {
        search?: string;
        type?: string;
        assignedUserId?: string;
    }): Promise<Client[]>;
    findById(id: string): Promise<Client | null>;
    create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client>;
    update(id: string, data: Partial<Client>): Promise<Client | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=client.repository.d.ts.map