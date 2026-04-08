export type UserRole =
  | 'root'
  | 'admin'
  | 'team_leader'
  | 'sales_rep'
  | 'technician'
  | 'analyst'
  | 'infoline'
  | 'accountant';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClientType = 'company' | 'individual';

export interface Client {
  id: string;
  type: ClientType;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  ico?: string;
  dic?: string;
  email?: string;
  phone?: string;
  marketingSource?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  notes?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  clientId: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'garage_doors' | 'windows' | 'shading';

export type KanbanStatus =
  | 'new_inquiry'
  | 'site_visit'
  | 'pricing'
  | 'waiting_material'
  | 'in_progress'
  | 'done'
  | 'invoiced';

export interface Project {
  id: string;
  clientId: string;
  locationId?: string;
  title: string;
  description?: string;
  type: ProjectType;
  status: KanbanStatus;
  assignedSalesId?: string;
  assignedTechnicianId?: string;
  totalPrice?: number;
  currency: string;
  scheduledDate?: string;
  deadline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  projectId?: string;
  clientId?: string;
  assignedUserId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceType = 'quote' | 'advance' | 'invoice';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  projectId?: string;
  clientId: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatTotal: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  userId: string;
  projectId?: string;
  clientId?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

// Notes / Comments (interní poznámky na entitách)
export interface Note {
  id: string;
  entityType: 'client' | 'project' | 'task' | 'invoice';
  entityId: string;
  userId: string;
  userName?: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Activity Log
export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName?: string;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'comment_added' | 'assigned';
  details?: string;
  createdAt: string;
}

// Material usage on projects
export interface MaterialUsage {
  id: string;
  projectId: string;
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  addedByUserId: string;
  addedByName?: string;
  createdAt: string;
}

// Received invoices (from suppliers)
export type ReceivedInvoiceStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface ReceivedInvoice {
  id: string;
  supplierName: string;
  supplierIco?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatTotal: number;
  total: number;
  currency: string;
  status: ReceivedInvoiceStatus;
  projectId?: string;
  ocrRawData?: string;
  filePath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Quick personal notes on dashboard
export interface QuickNote {
  id: string;
  userId: string;
  content: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Permission map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  root: ['*'],
  admin: ['*'],
  team_leader: [
    'dashboard:read',
    'clients:read', 'clients:write',
    'projects:read', 'projects:write',
    'tasks:read', 'tasks:write', 'tasks:approve',
    'calendar:read', 'calendar:write',
    'invoices:read',
    'inventory:read',
    'users:read',
  ],
  sales_rep: [
    'dashboard:read',
    'clients:read', 'clients:write',
    'projects:read', 'projects:write',
    'tasks:read', 'tasks:write',
    'calendar:read', 'calendar:write',
    'invoices:read', 'invoices:create',
  ],
  technician: [
    'dashboard:read',
    'tasks:read', 'tasks:update_own',
    'projects:read_assigned',
    'calendar:read_own',
  ],
  analyst: [
    'dashboard:read',
    'clients:read',
    'projects:read',
    'tasks:read',
    'invoices:read',
    'reports:read', 'reports:export',
    'inventory:read',
  ],
  infoline: [
    'dashboard:read',
    'clients:read', 'clients:write',
    'projects:create',
    'tasks:read', 'tasks:write',
    'calendar:read',
  ],
  accountant: [
    'dashboard:read',
    'invoices:read', 'invoices:write', 'invoices:export',
    'clients:read',
    'projects:read',
  ],
};
