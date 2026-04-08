import { v4 as uuid } from 'uuid';

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

const now = new Date().toISOString();
const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Hlavní sklad', street: 'Průmyslová 15', city: 'Praha 9', zip: '19000', notes: 'Centrální sklad materiálu', createdAt: now },
  { id: 'wh2', name: 'Sklad Brno', street: 'Vídeňská 88', city: 'Brno', zip: '63900', notes: 'Pobočka jih', createdAt: now },
];

const mockMovements: StockMovement[] = [
  { id: 'sm1', warehouseId: 'wh1', inventoryItemId: 'inv-i1', itemName: 'Hörmann LPU 42', type: 'in', quantity: 5, reason: 'Nákup od dodavatele', userId: 'u1', userName: 'Admin Root', createdAt: ago(48) },
  { id: 'sm2', warehouseId: 'wh1', inventoryItemId: 'inv-i1', itemName: 'Hörmann LPU 42', type: 'out', quantity: 2, reason: 'Zakázka p1 - Dejvice', projectId: 'p1', userId: 'u4', userName: 'Petr Dvořák', createdAt: ago(24) },
  { id: 'sm3', warehouseId: 'wh1', inventoryItemId: 'inv-i3', itemName: 'Pružiny torzní - sada', type: 'in', quantity: 10, reason: 'Nákup', userId: 'u1', userName: 'Admin Root', createdAt: ago(72) },
  { id: 'sm4', warehouseId: 'wh1', inventoryItemId: 'inv-i3', itemName: 'Pružiny torzní - sada', type: 'out', quantity: 1, reason: 'Servis p6', projectId: 'p6', userId: 'u4', userName: 'Petr Dvořák', createdAt: ago(20) },
  { id: 'sm5', warehouseId: 'wh2', inventoryItemId: 'inv-i5', itemName: 'Žaluzie C80 ALU', type: 'in', quantity: 8, reason: 'Nákup Somfy', userId: 'u1', userName: 'Admin Root', createdAt: ago(96) },
  { id: 'sm6', warehouseId: 'wh1', inventoryItemId: 'inv-i2', itemName: 'Hörmann SupraMatic', type: 'in', quantity: 5, reason: 'Nákup', userId: 'u1', userName: 'Admin Root', createdAt: ago(120) },
];

export class MockWarehouseRepository {
  private warehouses: Warehouse[] = [...mockWarehouses];
  private movements: StockMovement[] = [...mockMovements];

  async getWarehouses(): Promise<Warehouse[]> { return [...this.warehouses]; }

  async createWarehouse(data: Omit<Warehouse, 'id' | 'createdAt'>): Promise<Warehouse> {
    const wh: Warehouse = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    this.warehouses.push(wh);
    return wh;
  }

  async getMovements(filters?: { warehouseId?: string; inventoryItemId?: string; type?: string }): Promise<StockMovement[]> {
    let result = [...this.movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filters?.warehouseId) result = result.filter(m => m.warehouseId === filters.warehouseId);
    if (filters?.inventoryItemId) result = result.filter(m => m.inventoryItemId === filters.inventoryItemId);
    if (filters?.type) result = result.filter(m => m.type === filters.type);
    return result;
  }

  async addMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> {
    const mv: StockMovement = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    this.movements.push(mv);
    return mv;
  }
}
