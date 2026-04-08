import { v4 as uuid } from 'uuid';
import type { Project } from '../../models/types.js';
import type { IProjectRepository } from '../interfaces.js';
import { mockProjects } from '../mock-data.js';

export class MockProjectRepository implements IProjectRepository {
  private projects: Project[] = [...mockProjects];

  async findAll(filters?: {
    status?: string; type?: string; clientId?: string;
    assignedSalesId?: string; assignedTechnicianId?: string;
  }): Promise<Project[]> {
    let result = [...this.projects];
    if (filters?.status) result = result.filter(p => p.status === filters.status);
    if (filters?.type) result = result.filter(p => p.type === filters.type);
    if (filters?.clientId) result = result.filter(p => p.clientId === filters.clientId);
    if (filters?.assignedSalesId) result = result.filter(p => p.assignedSalesId === filters.assignedSalesId);
    if (filters?.assignedTechnicianId) result = result.filter(p => p.assignedTechnicianId === filters.assignedTechnicianId);
    return result;
  }

  async findById(id: string): Promise<Project | null> {
    return this.projects.find(p => p.id === id) ?? null;
  }

  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(project);
    return project;
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...data, updatedAt: new Date().toISOString() };
    return this.projects[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.projects.splice(idx, 1);
    return true;
  }
}
