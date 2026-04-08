export interface Lead {
    id: string;
    clientId?: string;
    clientName: string;
    phone: string;
    email?: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    assignedUserId?: string;
    assignedUserName?: string;
    notes?: string;
    lastContactedAt?: string;
    nextCallAt?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class MockLeadRepository {
    private leads;
    findAll(filters?: {
        status?: string;
        assignedUserId?: string;
    }): Promise<Lead[]>;
    findById(id: string): Promise<Lead | null>;
    create(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>;
    update(id: string, data: Partial<Lead>): Promise<Lead | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=lead.repository.d.ts.map