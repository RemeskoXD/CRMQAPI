import { v4 as uuid } from 'uuid';
import type { InventoryItem } from '../../models/types.js';
import type { IInventoryRepository } from '../interfaces.js';
import { mockInventory } from '../mock-data.js';

export class MockInventoryRepository implements IInventoryRepository {
  private items: InventoryItem[] = [...mockInventory];

  async findAll(filters?: { category?: string; search?: string }): Promise<InventoryItem[]> {
    let result = [...this.items];
    if (filters?.category) result = result.filter(i => i.category === filters.category);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.sku.toLowerCase().includes(s) ||
        i.description?.toLowerCase().includes(s)
      );
    }
    return result;
  }

  async findById(id: string): Promise<InventoryItem | null> {
    return this.items.find(i => i.id === id) ?? null;
  }

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const item: InventoryItem = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...data, updatedAt: new Date().toISOString() };
    return this.items[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
