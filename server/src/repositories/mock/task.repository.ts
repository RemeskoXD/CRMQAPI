import { v4 as uuid } from 'uuid';
import type { Task } from '../../models/types.js';
import type { ITaskRepository } from '../interfaces.js';
import { mockTasks } from '../mock-data.js';

export class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [...mockTasks];

  async findAll(filters?: {
    projectId?: string; clientId?: string; assignedUserId?: string; status?: string;
  }): Promise<Task[]> {
    let result = [...this.tasks];
    if (filters?.projectId) result = result.filter(t => t.projectId === filters.projectId);
    if (filters?.clientId) result = result.filter(t => t.clientId === filters.clientId);
    if (filters?.assignedUserId) result = result.filter(t => t.assignedUserId === filters.assignedUserId);
    if (filters?.status) result = result.filter(t => t.status === filters.status);
    return result;
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === id) ?? null;
  }

  async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() };
    return this.tasks[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }
}
