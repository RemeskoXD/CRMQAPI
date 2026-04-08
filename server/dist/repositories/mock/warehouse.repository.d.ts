export interface Warehouse {
    id: string;
    name: string;
    street: string;
    city: string;
    zip: string;
    notes?: string;
    createdAt: string;
}
export interface StockMovement {
    id: string;
    warehouseId: string;
    inventoryItemId: string;
    itemName: string;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    projectId?: string;
    userId: string;
    userName?: string;
    createdAt: string;
}
export declare class MockWarehouseRepository {
    private warehouses;
    private movements;
    getWarehouses(): Promise<Warehouse[]>;
    createWarehouse(data: Omit<Warehouse, 'id' | 'createdAt'>): Promise<Warehouse>;
    getMovements(filters?: {
        warehouseId?: string;
        inventoryItemId?: string;
        type?: string;
    }): Promise<StockMovement[]>;
    addMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement>;
}
//# sourceMappingURL=warehouse.repository.d.ts.map