import type { MaterialUsage } from '../../models/types.js';
export declare class MockMaterialRepository {
    private materials;
    findByProject(projectId: string): Promise<MaterialUsage[]>;
    create(data: Omit<MaterialUsage, 'id' | 'createdAt'>): Promise<MaterialUsage>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=material.repository.d.ts.map