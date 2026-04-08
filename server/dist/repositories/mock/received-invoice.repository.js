"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockReceivedInvoiceRepository = void 0;
const uuid_1 = require("uuid");
const now = new Date().toISOString();
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString(); };
const mockReceivedInvoices = [
    {
        id: 'ri1', supplierName: 'Hörmann Česká republika s.r.o.', supplierIco: '49286234',
        invoiceNumber: 'HCR-2026-00452', issueDate: day(-14), dueDate: day(16),
        subtotal: 148760, vatTotal: 31240, total: 180000, currency: 'CZK',
        status: 'approved', projectId: 'p1', createdAt: now, updatedAt: now,
    },
    {
        id: 'ri2', supplierName: 'VEKRA okna s.r.o.', supplierIco: '28089421',
        invoiceNumber: 'VEK-F-2026-1834', issueDate: day(-7), dueDate: day(23),
        subtotal: 198347, vatTotal: 41653, total: 240000, currency: 'CZK',
        status: 'pending', projectId: 'p2', createdAt: now, updatedAt: now,
    },
    {
        id: 'ri3', supplierName: 'Somfy spol. s r.o.', supplierIco: '15267890',
        invoiceNumber: 'SOM-2026-03291', issueDate: day(-3), dueDate: day(27),
        subtotal: 27273, vatTotal: 5727, total: 33000, currency: 'CZK',
        status: 'pending', projectId: 'p4', createdAt: now, updatedAt: now,
    },
];
class MockReceivedInvoiceRepository {
    invoices = [...mockReceivedInvoices];
    async findAll(filters) {
        let result = [...this.invoices];
        if (filters?.status)
            result = result.filter(i => i.status === filters.status);
        if (filters?.projectId)
            result = result.filter(i => i.projectId === filters.projectId);
        return result;
    }
    async findById(id) {
        return this.invoices.find(i => i.id === id) ?? null;
    }
    async create(data) {
        const inv = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        this.invoices.push(inv);
        return inv;
    }
    async update(id, data) {
        const idx = this.invoices.findIndex(i => i.id === id);
        if (idx === -1)
            return null;
        this.invoices[idx] = { ...this.invoices[idx], ...data, updatedAt: new Date().toISOString() };
        return this.invoices[idx];
    }
}
exports.MockReceivedInvoiceRepository = MockReceivedInvoiceRepository;
//# sourceMappingURL=received-invoice.repository.js.map