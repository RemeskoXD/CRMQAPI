import { MockUserRepository } from './mock/user.repository.js';
import { MockClientRepository } from './mock/client.repository.js';
import { MockLocationRepository } from './mock/location.repository.js';
import { MockProjectRepository } from './mock/project.repository.js';
import { MockTaskRepository } from './mock/task.repository.js';
import { MockInvoiceRepository } from './mock/invoice.repository.js';
import { MockInventoryRepository } from './mock/inventory.repository.js';
import { MockCalendarEventRepository } from './mock/calendar.repository.js';
import { MockNoteRepository } from './mock/notes.repository.js';
import { MockActivityRepository } from './mock/activity.repository.js';
import { MockMaterialRepository } from './mock/material.repository.js';
import { MockReceivedInvoiceRepository } from './mock/received-invoice.repository.js';
import { MockQuickNoteRepository } from './mock/quicknote.repository.js';
import { MockWarehouseRepository } from './mock/warehouse.repository.js';
import { MockLeadRepository } from './mock/lead.repository.js';
import { MockDesktopRepository } from './mock/desktop.repository.js';
import type {
  IUserRepository, IClientRepository, ILocationRepository,
  IProjectRepository, ITaskRepository, IInvoiceRepository,
  IInventoryRepository, ICalendarEventRepository,
} from './interfaces.js';

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

export function createRepositories(): Repositories {
  return {
    users: new MockUserRepository(),
    clients: new MockClientRepository(),
    locations: new MockLocationRepository(),
    projects: new MockProjectRepository(),
    tasks: new MockTaskRepository(),
    invoices: new MockInvoiceRepository(),
    inventory: new MockInventoryRepository(),
    calendarEvents: new MockCalendarEventRepository(),
    notes: new MockNoteRepository(),
    activity: new MockActivityRepository(),
    materials: new MockMaterialRepository(),
    receivedInvoices: new MockReceivedInvoiceRepository(),
    quickNotes: new MockQuickNoteRepository(),
    warehouses: new MockWarehouseRepository(),
    leads: new MockLeadRepository(),
    desktop: new MockDesktopRepository(),
  };
}

export type { IUserRepository, IClientRepository, ILocationRepository, IProjectRepository, ITaskRepository, IInvoiceRepository, IInventoryRepository, ICalendarEventRepository } from './interfaces.js';
