import { v4 as uuid } from 'uuid';
import type { MaterialUsage } from '../../models/types.js';

const now = new Date().toISOString();

const mockMaterial: MaterialUsage[] = [
  { id: 'm1', projectId: 'p1', inventoryItemId: 'inv-i1', description: 'Hörmann LPU 42 - standardní', quantity: 2, unit: 'ks', unitPrice: 62000, totalPrice: 124000, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
  { id: 'm2', projectId: 'p1', inventoryItemId: 'inv-i2', description: 'Hörmann SupraMatic - pohon', quantity: 2, unit: 'ks', unitPrice: 18000, totalPrice: 36000, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
  { id: 'm3', projectId: 'p6', inventoryItemId: 'inv-i3', description: 'Pružiny torzní - sada', quantity: 1, unit: 'sada', unitPrice: 4500, totalPrice: 4500, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
  { id: 'm4', projectId: 'p4', inventoryItemId: 'inv-i5', description: 'Žaluzie C80 ALU', quantity: 6, unit: 'ks', unitPrice: 12000, totalPrice: 72000, addedByUserId: 'u3', addedByName: 'Andrej Kováč', createdAt: now },
  { id: 'm5', projectId: 'p4', inventoryItemId: 'inv-i6', description: 'Somfy io motor', quantity: 6, unit: 'ks', unitPrice: 5500, totalPrice: 33000, addedByUserId: 'u3', addedByName: 'Andrej Kováč', createdAt: now },
];

export class MockMaterialRepository {
  private materials: MaterialUsage[] = [...mockMaterial];

  async findByProject(projectId: string): Promise<MaterialUsage[]> {
    return this.materials.filter(m => m.projectId === projectId);
  }

  async create(data: Omit<MaterialUsage, 'id' | 'createdAt'>): Promise<MaterialUsage> {
    const item: MaterialUsage = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    this.materials.push(item);
    return item;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.materials.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.materials.splice(idx, 1);
    return true;
  }
}
