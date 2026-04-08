import type { User, Client, Location, Project, Task, Invoice, InventoryItem, CalendarEvent } from '../models/types.js';
export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
export interface IClientRepository {
    findAll(filters?: {
        search?: string;
        type?: string;
        assignedUserId?: string;
    }): Promise<Client[]>;
    findById(id: string): Promise<Client | null>;
    create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client>;
    update(id: string, data: Partial<Client>): Promise<Client | null>;
    delete(id: string): Promise<boolean>;
}
export interface ILocationRepository {
    findAll(clientId?: string): Promise<Location[]>;
    findById(id: string): Promise<Location | null>;
    create(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location>;
    update(id: string, data: Partial<Location>): Promise<Location | null>;
    delete(id: string): Promise<boolean>;
}
export interface IProjectRepository {
    findAll(filters?: {
        status?: string;
        type?: string;
        clientId?: string;
        assignedSalesId?: string;
        assignedTechnicianId?: string;
    }): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    update(id: string, data: Partial<Project>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
}
export interface ITaskRepository {
    findAll(filters?: {
        projectId?: string;
        clientId?: string;
        assignedUserId?: string;
        status?: string;
    }): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    update(id: string, data: Partial<Task>): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}
export interface IInvoiceRepository {
    findAll(filters?: {
        clientId?: string;
        projectId?: string;
        type?: string;
        status?: string;
    }): Promise<Invoice[]>;
    findById(id: string): Promise<Invoice | null>;
    create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
    update(id: string, data: Partial<Invoice>): Promise<Invoice | null>;
    delete(id: string): Promise<boolean>;
}
export interface IInventoryRepository {
    findAll(filters?: {
        category?: string;
        search?: string;
    }): Promise<InventoryItem[]>;
    findById(id: string): Promise<InventoryItem | null>;
    create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem>;
    update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null>;
    delete(id: string): Promise<boolean>;
}
export interface ICalendarEventRepository {
    findAll(filters?: {
        userId?: string;
        from?: string;
        to?: string;
    }): Promise<CalendarEvent[]>;
    findById(id: string): Promise<CalendarEvent | null>;
    create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;
    update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=interfaces.d.ts.map