import { v4 as uuid } from 'uuid';
import type { Client } from '../../models/types.js';
import type { IClientRepository } from '../interfaces.js';
import { mockClients } from '../mock-data.js';

export class MockClientRepository implements IClientRepository {
  private clients: Client[] = [...mockClients];

  async findAll(filters?: { search?: string; type?: string; assignedUserId?: string }): Promise<Client[]> {
    let result = [...this.clients];
    if (filters?.type) result = result.filter(c => c.type === filters.type);
    if (filters?.assignedUserId) result = result.filter(c => c.assignedUserId === filters.assignedUserId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(c =>
        (c.companyName?.toLowerCase().includes(s)) ||
        (c.firstName?.toLowerCase().includes(s)) ||
        (c.lastName?.toLowerCase().includes(s)) ||
        (c.email?.toLowerCase().includes(s)) ||
        (c.ico?.includes(s))
      );
    }
    return result;
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.find(c => c.id === id) ?? null;
  }

  async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const client: Client = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.clients.push(client);
    return client;
  }

  async update(id: string, data: Partial<Client>): Promise<Client | null> {
    const idx = this.clients.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.clients[idx] = { ...this.clients[idx], ...data, updatedAt: new Date().toISOString() };
    return this.clients[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.clients.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.clients.splice(idx, 1);
    return true;
  }
}
