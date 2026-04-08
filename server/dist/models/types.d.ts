export type UserRole = 'root' | 'admin' | 'team_leader' | 'sales_rep' | 'technician' | 'analyst' | 'infoline' | 'accountant';
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
export type KanbanStatus = 'new_inquiry' | 'site_visit' | 'pricing' | 'waiting_material' | 'in_progress' | 'done' | 'invoiced';
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
export interface QuickNote {
    id: string;
    userId: string;
    content: string;
    color: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare const ROLE_PERMISSIONS: Record<UserRole, string[]>;
//# sourceMappingURL=types.d.ts.map