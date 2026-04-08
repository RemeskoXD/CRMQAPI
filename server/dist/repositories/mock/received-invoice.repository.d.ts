import type { ReceivedInvoice } from '../../models/types.js';
export declare class MockReceivedInvoiceRepository {
    private invoices;
    findAll(filters?: {
        status?: string;
        projectId?: string;
    }): Promise<ReceivedInvoice[]>;
    findById(id: string): Promise<ReceivedInvoice | null>;
    create(data: Omit<ReceivedInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReceivedInvoice>;
    update(id: string, data: Partial<ReceivedInvoice>): Promise<ReceivedInvoice | null>;
}
//# sourceMappingURL=received-invoice.repository.d.ts.map