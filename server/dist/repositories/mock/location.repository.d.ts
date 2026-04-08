import type { Location } from '../../models/types.js';
import type { ILocationRepository } from '../interfaces.js';
export declare class MockLocationRepository implements ILocationRepository {
    private locations;
    findAll(clientId?: string): Promise<Location[]>;
    findById(id: string): Promise<Location | null>;
    create(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location>;
    update(id: string, data: Partial<Location>): Promise<Location | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=location.repository.d.ts.map