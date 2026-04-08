"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockInvoiceRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockInvoiceRepository {
    invoices = [...mock_data_js_1.mockInvoices];
    async findAll(filters) {
        let result = [...this.invoices];
        if (filters?.clientId)
            result = result.filter(i => i.clientId === filters.clientId);
        if (filters?.projectId)
            result = result.filter(i => i.projectId === filters.projectId);
        if (filters?.type)
            result = result.filter(i => i.type === filters.type);
        if (filters?.status)
            result = result.filter(i => i.status === filters.status);
        return result;
    }
    async findById(id) {
        return this.invoices.find(i => i.id === id) ?? null;
    }
    async create(data) {
        const invoice = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.invoices.push(invoice);
        return invoice;
    }
    async update(id, data) {
        const idx = this.invoices.findIndex(i => i.id === id);
        if (idx === -1)
            return null;
        this.invoices[idx] = { ...this.invoices[idx], ...data, updatedAt: new Date().toISOString() };
        return this.invoices[idx];
    }
    async delete(id) {
        const idx = this.invoices.findIndex(i => i.id === id);
        if (idx === -1)
            return false;
        this.invoices.splice(idx, 1);
        return true;
    }
}
exports.MockInvoiceRepository = MockInvoiceRepository;
//# sourceMappingURL=invoice.repository.js.map