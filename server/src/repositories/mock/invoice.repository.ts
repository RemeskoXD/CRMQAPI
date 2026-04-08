import { v4 as uuid } from 'uuid';
import type { Invoice } from '../../models/types.js';
import type { IInvoiceRepository } from '../interfaces.js';
import { mockInvoices } from '../mock-data.js';

export class MockInvoiceRepository implements IInvoiceRepository {
  private invoices: Invoice[] = [...mockInvoices];

  async findAll(filters?: {
    clientId?: string; projectId?: string; type?: string; status?: string;
  }): Promise<Invoice[]> {
    let result = [...this.invoices];
    if (filters?.clientId) result = result.filter(i => i.clientId === filters.clientId);
    if (filters?.projectId) result = result.filter(i => i.projectId === filters.projectId);
    if (filters?.type) result = result.filter(i => i.type === filters.type);
    if (filters?.status) result = result.filter(i => i.status === filters.status);
    return result;
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoices.find(i => i.id === id) ?? null;
  }

  async create(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoice: Invoice = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.invoices.push(invoice);
    return invoice;
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const idx = this.invoices.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.invoices[idx] = { ...this.invoices[idx], ...data, updatedAt: new Date().toISOString() };
    return this.invoices[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.invoices.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.invoices.splice(idx, 1);
    return true;
  }
}
