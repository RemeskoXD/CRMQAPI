import type { InventoryItem } from '../../models/types.js';
import type { IInventoryRepository } from '../interfaces.js';
export declare class MockInventoryRepository implements IInventoryRepository {
    private items;
    findAll(filters?: {
        category?: string;
        search?: string;
    }): Promise<InventoryItem[]>;
    findById(id: string): Promise<InventoryItem | null>;
    create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem>;
    update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=inventory.repository.d.ts.map