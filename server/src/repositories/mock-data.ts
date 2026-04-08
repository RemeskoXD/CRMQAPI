import type {
  User, Client, Location, Project, Task, Invoice, InventoryItem, CalendarEvent,
} from '../models/types.js';

const now = new Date().toISOString();
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

export const mockUsers: User[] = [
  {
    id: 'u1', firstName: 'Admin', lastName: 'Root', email: 'admin@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', // "admin123"
    role: 'root', phone: '+420600111222', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u2', firstName: 'Marek', lastName: 'Novák', email: 'marek@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'team_leader', phone: '+420600222333', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u3', firstName: 'Andrej', lastName: 'Kováč', email: 'andrej@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'sales_rep', phone: '+420600333444', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u4', firstName: 'Petr', lastName: 'Dvořák', email: 'petr@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'technician', phone: '+420600444555', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u5', firstName: 'Jana', lastName: 'Svobodová', email: 'jana@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'technician', phone: '+420600555666', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u6', firstName: 'Eva', lastName: 'Procházková', email: 'eva@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'analyst', phone: '+420600666777', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u7', firstName: 'Lucie', lastName: 'Černá', email: 'lucie@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'infoline', phone: '+420600777888', isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'u8', firstName: 'Martin', lastName: 'Veselý', email: 'martin@crmq.cz',
    passwordHash: '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W',
    role: 'accountant', phone: '+420600888999', isActive: true, createdAt: now, updatedAt: now,
  },
];

export const mockClients: Client[] = [
  {
    id: 'c1', type: 'company', companyName: 'Stavby Praha s.r.o.', ico: '12345678', dic: 'CZ12345678',
    email: 'info@stavbypraha.cz', phone: '+420700111222', marketingSource: 'Google Ads',
    billingStreet: 'Vinohradská 120', billingCity: 'Praha 2', billingZip: '12000', billingCountry: 'CZ',
    assignedUserId: 'u3', createdAt: now, updatedAt: now,
  },
  {
    id: 'c2', type: 'individual', firstName: 'Karel', lastName: 'Novotný',
    email: 'karel.novotny@email.cz', phone: '+420700222333', marketingSource: 'Doporučení',
    billingStreet: 'Masarykova 45', billingCity: 'Brno', billingZip: '60200', billingCountry: 'CZ',
    assignedUserId: 'u3', createdAt: now, updatedAt: now,
  },
  {
    id: 'c3', type: 'company', companyName: 'AutoDům Ostrava a.s.', ico: '87654321', dic: 'CZ87654321',
    email: 'obchod@autodum-ova.cz', phone: '+420700333444', marketingSource: 'Webový formulář',
    billingStreet: 'Porubská 88', billingCity: 'Ostrava', billingZip: '70800', billingCountry: 'CZ',
    assignedUserId: 'u3', createdAt: now, updatedAt: now,
  },
  {
    id: 'c4', type: 'individual', firstName: 'Marie', lastName: 'Horáková',
    email: 'marie.h@seznam.cz', phone: '+420700444555', marketingSource: 'Facebook',
    billingStreet: 'Jiráskova 12', billingCity: 'Plzeň', billingZip: '30100', billingCountry: 'CZ',
    assignedUserId: 'u3', createdAt: now, updatedAt: now,
  },
  {
    id: 'c5', type: 'company', companyName: 'Rezidence Karlín s.r.o.', ico: '11223344', dic: 'CZ11223344',
    email: 'sprava@rezidence-karlin.cz', phone: '+420700555666', marketingSource: 'Google Ads',
    billingStreet: 'Křižíkova 200', billingCity: 'Praha 8', billingZip: '18600', billingCountry: 'CZ',
    assignedUserId: 'u2', createdAt: now, updatedAt: now,
  },
];

export const mockLocations: Location[] = [
  {
    id: 'l1', clientId: 'c1', label: 'Sídlo firmy', street: 'Vinohradská 120',
    city: 'Praha 2', zip: '12000', country: 'CZ', createdAt: now, updatedAt: now,
  },
  {
    id: 'l2', clientId: 'c1', label: 'Stavba - Dejvice', street: 'Evropská 33',
    city: 'Praha 6', zip: '16000', country: 'CZ', createdAt: now, updatedAt: now,
  },
  {
    id: 'l3', clientId: 'c2', label: 'Rodinný dům', street: 'Masarykova 45',
    city: 'Brno', zip: '60200', country: 'CZ', createdAt: now, updatedAt: now,
  },
  {
    id: 'l4', clientId: 'c3', label: 'Autosalon', street: 'Porubská 88',
    city: 'Ostrava', zip: '70800', country: 'CZ', createdAt: now, updatedAt: now,
  },
  {
    id: 'l5', clientId: 'c4', label: 'Dům', street: 'Jiráskova 12',
    city: 'Plzeň', zip: '30100', country: 'CZ', createdAt: now, updatedAt: now,
  },
];

export const mockProjects: Project[] = [
  {
    id: 'p1', clientId: 'c1', locationId: 'l2', title: 'Sekční vrata - novostavba Dejvice',
    description: 'Montáž 2ks sekčních garážových vrat Hörmann LPU 42',
    type: 'garage_doors', status: 'in_progress', assignedSalesId: 'u3', assignedTechnicianId: 'u4',
    totalPrice: 185000, currency: 'CZK', scheduledDate: day(3), deadline: day(10),
    createdAt: now, updatedAt: now,
  },
  {
    id: 'p2', clientId: 'c2', locationId: 'l3', title: 'Výměna oken - RD Brno',
    description: 'Kompletní výměna 8ks plastových oken za dřevěná eurookna',
    type: 'windows', status: 'pricing', assignedSalesId: 'u3',
    totalPrice: 320000, currency: 'CZK', deadline: day(21),
    createdAt: now, updatedAt: now,
  },
  {
    id: 'p3', clientId: 'c3', locationId: 'l4', title: 'Průmyslová vrata - AutoDům',
    description: 'Montáž rychloběžných průmyslových vrat 4x4m',
    type: 'garage_doors', status: 'waiting_material', assignedSalesId: 'u3', assignedTechnicianId: 'u5',
    totalPrice: 450000, currency: 'CZK', scheduledDate: day(7), deadline: day(14),
    createdAt: now, updatedAt: now,
  },
  {
    id: 'p4', clientId: 'c4', locationId: 'l5', title: 'Venkovní žaluzie - RD Plzeň',
    description: 'Instalace venkovních žaluzií C80 na 6 oken',
    type: 'shading', status: 'site_visit', assignedSalesId: 'u3',
    totalPrice: 95000, currency: 'CZK', deadline: day(30),
    createdAt: now, updatedAt: now,
  },
  {
    id: 'p5', clientId: 'c5', locationId: undefined, title: 'Garážová vrata - Rezidence Karlín',
    description: 'Poptávka na 12ks garážových vrat do podzemních garáží',
    type: 'garage_doors', status: 'new_inquiry', assignedSalesId: 'u2',
    totalPrice: undefined, currency: 'CZK',
    createdAt: now, updatedAt: now,
  },
  {
    id: 'p6', clientId: 'c1', locationId: 'l1', title: 'Servis vrat - sídlo Stavby Praha',
    description: 'Pravidelný servis sekčních vrat, výměna pružin',
    type: 'garage_doors', status: 'done', assignedSalesId: 'u3', assignedTechnicianId: 'u4',
    totalPrice: 12000, currency: 'CZK',
    createdAt: now, updatedAt: now,
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1', projectId: 'p1', assignedUserId: 'u4', title: 'Montáž vodících lišt',
    description: 'Připravit a namontovat vodící lišty pro oboje vrata',
    status: 'in_progress', priority: 'high', dueDate: day(3), createdAt: now, updatedAt: now,
  },
  {
    id: 't2', projectId: 'p1', assignedUserId: 'u4', title: 'Elektroinstalace pohonu',
    status: 'pending', priority: 'high', dueDate: day(4), createdAt: now, updatedAt: now,
  },
  {
    id: 't3', projectId: 'p2', assignedUserId: 'u3', title: 'Zaměření oken',
    description: 'Jet na místo a zaměřit všech 8 okenních otvorů',
    status: 'pending', priority: 'medium', dueDate: day(5), createdAt: now, updatedAt: now,
  },
  {
    id: 't4', projectId: 'p3', assignedUserId: 'u5', title: 'Kontrola stavební připravenosti',
    status: 'done', priority: 'medium', dueDate: day(-2), completedAt: day(-1), createdAt: now, updatedAt: now,
  },
  {
    id: 't5', projectId: 'p4', assignedUserId: 'u3', title: 'Obhlídka a zaměření - Plzeň',
    status: 'pending', priority: 'medium', dueDate: day(2), createdAt: now, updatedAt: now,
  },
  {
    id: 't6', clientId: 'c5', assignedUserId: 'u2', title: 'Kontaktovat klienta Rezidence Karlín',
    description: 'Domluvit schůzku pro prezentaci řešení',
    status: 'pending', priority: 'high', dueDate: day(1), createdAt: now, updatedAt: now,
  },
  {
    id: 't7', projectId: 'p3', assignedUserId: 'u5', title: 'Příprava montážního materiálu',
    status: 'pending', priority: 'high', dueDate: day(6), createdAt: now, updatedAt: now,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', projectId: 'p1', clientId: 'c1', invoiceNumber: 'CN-2026-001',
    type: 'quote', status: 'sent', issueDate: day(-10), dueDate: day(4),
    subtotal: 152893, vatTotal: 32107, total: 185000, currency: 'CZK',
    items: [
      { id: 'ii1', invoiceId: 'inv1', description: 'Sekční vrata Hörmann LPU 42 - 2ks', quantity: 2, unitPrice: 62000, vatRate: 21, totalPrice: 150040 },
      { id: 'ii2', invoiceId: 'inv1', description: 'Montáž a doprava', quantity: 1, unitPrice: 28000, vatRate: 21, totalPrice: 33880 },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'inv2', projectId: 'p1', clientId: 'c1', invoiceNumber: 'ZF-2026-001',
    type: 'advance', status: 'paid', issueDate: day(-7), dueDate: day(-1),
    subtotal: 76446, vatTotal: 16054, total: 92500, currency: 'CZK',
    items: [
      { id: 'ii3', invoiceId: 'inv2', description: 'Záloha 50% - sekční vrata Dejvice', quantity: 1, unitPrice: 76446, vatRate: 21, totalPrice: 92500 },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'inv3', projectId: 'p6', clientId: 'c1', invoiceNumber: 'FA-2026-001',
    type: 'invoice', status: 'paid', issueDate: day(-5), dueDate: day(9),
    subtotal: 9917, vatTotal: 2083, total: 12000, currency: 'CZK',
    items: [
      { id: 'ii4', invoiceId: 'inv3', description: 'Servis sekčních vrat - práce', quantity: 2, unitPrice: 1500, vatRate: 21, totalPrice: 3630 },
      { id: 'ii5', invoiceId: 'inv3', description: 'Pružiny torzní - sada', quantity: 1, unitPrice: 6917, vatRate: 21, totalPrice: 8370 },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'inv4', projectId: 'p3', clientId: 'c3', invoiceNumber: 'CN-2026-002',
    type: 'quote', status: 'draft', issueDate: now, dueDate: day(14),
    subtotal: 371901, vatTotal: 78099, total: 450000, currency: 'CZK',
    items: [
      { id: 'ii6', invoiceId: 'inv4', description: 'Rychloběžná průmyslová vrata 4x4m', quantity: 1, unitPrice: 310000, vatRate: 21, totalPrice: 375100 },
      { id: 'ii7', invoiceId: 'inv4', description: 'Montáž + elektro', quantity: 1, unitPrice: 61901, vatRate: 21, totalPrice: 74900 },
    ],
    createdAt: now, updatedAt: now,
  },
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv-i1', sku: 'HOR-LPU42-S', name: 'Hörmann LPU 42 - standardní', description: 'Sekční garážová vrata Hörmann', category: 'garage_doors', unit: 'ks', pricePerUnit: 62000, stockQuantity: 3, minStockLevel: 1, createdAt: now, updatedAt: now },
  { id: 'inv-i2', sku: 'HOR-SUP-M', name: 'Hörmann SupraMatic', description: 'Pohon pro sekční vrata', category: 'garage_doors', unit: 'ks', pricePerUnit: 18000, stockQuantity: 5, minStockLevel: 2, createdAt: now, updatedAt: now },
  { id: 'inv-i3', sku: 'PRU-TOR-SET', name: 'Pružiny torzní - sada', category: 'garage_doors', unit: 'sada', pricePerUnit: 4500, stockQuantity: 12, minStockLevel: 5, createdAt: now, updatedAt: now },
  { id: 'inv-i4', sku: 'EUR-IV68-W', name: 'Eurookno IV68 - bílé', description: 'Dřevěné eurookno profil IV68', category: 'windows', unit: 'ks', pricePerUnit: 8500, stockQuantity: 0, minStockLevel: 0, createdAt: now, updatedAt: now },
  { id: 'inv-i5', sku: 'ZAL-C80-ALU', name: 'Žaluzie C80 ALU', description: 'Venkovní hliníková žaluzie C80', category: 'shading', unit: 'ks', pricePerUnit: 12000, stockQuantity: 8, minStockLevel: 3, createdAt: now, updatedAt: now },
  { id: 'inv-i6', sku: 'MOT-SOM-IO', name: 'Somfy io motor', description: 'Motor pro venkovní žaluzie', category: 'shading', unit: 'ks', pricePerUnit: 5500, stockQuantity: 15, minStockLevel: 5, createdAt: now, updatedAt: now },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'ce1', title: 'Montáž vrat - Dejvice', userId: 'u4', projectId: 'p1', clientId: 'c1', start: day(3) , end: day(5), allDay: true, color: '#D4AF37', createdAt: now, updatedAt: now },
  { id: 'ce2', title: 'Obhlídka - Plzeň', userId: 'u3', projectId: 'p4', clientId: 'c4', start: day(2), end: day(2), allDay: false, color: '#4A90D9', createdAt: now, updatedAt: now },
  { id: 'ce3', title: 'Schůzka Rezidence Karlín', userId: 'u2', clientId: 'c5', start: day(1), end: day(1), allDay: false, color: '#D4AF37', createdAt: now, updatedAt: now },
  { id: 'ce4', title: 'Montáž vrat - AutoDům Ostrava', userId: 'u5', projectId: 'p3', clientId: 'c3', start: day(7), end: day(9), allDay: true, color: '#D4AF37', createdAt: now, updatedAt: now },
  { id: 'ce5', title: 'Zaměření oken - Brno', userId: 'u3', projectId: 'p2', clientId: 'c2', start: day(5), end: day(5), allDay: false, color: '#4A90D9', createdAt: now, updatedAt: now },
];
