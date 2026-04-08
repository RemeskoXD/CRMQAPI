"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockClientRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockClientRepository {
    clients = [...mock_data_js_1.mockClients];
    async findAll(filters) {
        let result = [...this.clients];
        if (filters?.type)
            result = result.filter(c => c.type === filters.type);
        if (filters?.assignedUserId)
            result = result.filter(c => c.assignedUserId === filters.assignedUserId);
        if (filters?.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(c => (c.companyName?.toLowerCase().includes(s)) ||
                (c.firstName?.toLowerCase().includes(s)) ||
                (c.lastName?.toLowerCase().includes(s)) ||
                (c.email?.toLowerCase().includes(s)) ||
                (c.ico?.includes(s)));
        }
        return result;
    }
    async findById(id) {
        return this.clients.find(c => c.id === id) ?? null;
    }
    async create(data) {
        const client = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.clients.push(client);
        return client;
    }
    async update(id, data) {
        const idx = this.clients.findIndex(c => c.id === id);
        if (idx === -1)
            return null;
        this.clients[idx] = { ...this.clients[idx], ...data, updatedAt: new Date().toISOString() };
        return this.clients[idx];
    }
    async delete(id) {
        const idx = this.clients.findIndex(c => c.id === id);
        if (idx === -1)
            return false;
        this.clients.splice(idx, 1);
        return true;
    }
}
exports.MockClientRepository = MockClientRepository;
//# sourceMappingURL=client.repository.js.map