import type { Invoice } from '../../models/types.js';
import type { IInvoiceRepository } from '../interfaces.js';
export declare class MockInvoiceRepository implements IInvoiceRepository {
    private invoices;
    findAll(filters?: {
        clientId?: string;
        projectId?: string;
        type?: string;
        status?: string;
    }): Promise<Invoice[]>;
    findById(id: string): Promise<Invoice | null>;
    create(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
    update(id: string, data: Partial<Invoice>): Promise<Invoice | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=invoice.repository.d.ts.map