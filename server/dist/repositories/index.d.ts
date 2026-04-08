import { MockNoteRepository } from './mock/notes.repository.js';
import { MockActivityRepository } from './mock/activity.repository.js';
import { MockMaterialRepository } from './mock/material.repository.js';
import { MockReceivedInvoiceRepository } from './mock/received-invoice.repository.js';
import { MockQuickNoteRepository } from './mock/quicknote.repository.js';
import { MockWarehouseRepository } from './mock/warehouse.repository.js';
import { MockLeadRepository } from './mock/lead.repository.js';
import { MockDesktopRepository } from './mock/desktop.repository.js';
import type { IUserRepository, IClientRepository, ILocationRepository, IProjectRepository, ITaskRepository, IInvoiceRepository, IInventoryRepository, ICalendarEventRepository } from './interfaces.js';
export interface Repositories {
    users: IUserRepository;
    clients: IClientRepository;
    locations: ILocationRepository;
    projects: IProjectRepository;
    tasks: ITaskRepository;
    invoices: IInvoiceRepository;
    inventory: IInventoryRepository;
    calendarEvents: ICalendarEventRepository;
    notes: MockNoteRepository;
    activity: MockActivityRepository;
    materials: MockMaterialRepository;
    receivedInvoices: MockReceivedInvoiceRepository;
    quickNotes: MockQuickNoteRepository;
    warehouses: MockWarehouseRepository;
    leads: MockLeadRepository;
    desktop: MockDesktopRepository;
}
export declare function createRepositories(): Repositories;
export type { IUserRepository, IClientRepository, ILocationRepository, IProjectRepository, ITaskRepository, IInvoiceRepository, IInventoryRepository, ICalendarEventRepository } from './interfaces.js';
//# sourceMappingURL=index.d.ts.map