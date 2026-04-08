import { v4 as uuid } from 'uuid';
import type { User } from '../../models/types.js';
import type { IUserRepository } from '../interfaces.js';
import { mockUsers } from '../mock-data.js';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [...mockUsers];

  async findAll(): Promise<User[]> {
    return this.users.filter(u => u.isActive);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) ?? null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date().toISOString() };
    return this.users[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users[idx].isActive = false;
    return true;
  }
}
