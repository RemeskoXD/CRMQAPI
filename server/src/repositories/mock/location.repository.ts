import { v4 as uuid } from 'uuid';
import type { Location } from '../../models/types.js';
import type { ILocationRepository } from '../interfaces.js';
import { mockLocations } from '../mock-data.js';

export class MockLocationRepository implements ILocationRepository {
  private locations: Location[] = [...mockLocations];

  async findAll(clientId?: string): Promise<Location[]> {
    if (clientId) return this.locations.filter(l => l.clientId === clientId);
    return [...this.locations];
  }

  async findById(id: string): Promise<Location | null> {
    return this.locations.find(l => l.id === id) ?? null;
  }

  async create(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const location: Location = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.locations.push(location);
    return location;
  }

  async update(id: string, data: Partial<Location>): Promise<Location | null> {
    const idx = this.locations.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.locations[idx] = { ...this.locations[idx], ...data, updatedAt: new Date().toISOString() };
    return this.locations[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.locations.findIndex(l => l.id === id);
    if (idx === -1) return false;
    this.locations.splice(idx, 1);
    return true;
  }
}
