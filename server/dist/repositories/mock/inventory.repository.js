"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockInventoryRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockInventoryRepository {
    items = [...mock_data_js_1.mockInventory];
    async findAll(filters) {
        let result = [...this.items];
        if (filters?.category)
            result = result.filter(i => i.category === filters.category);
        if (filters?.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(i => i.name.toLowerCase().includes(s) ||
                i.sku.toLowerCase().includes(s) ||
                i.description?.toLowerCase().includes(s));
        }
        return result;
    }
    async findById(id) {
        return this.items.find(i => i.id === id) ?? null;
    }
    async create(data) {
        const item = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.items.push(item);
        return item;
    }
    async update(id, data) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1)
            return null;
        this.items[idx] = { ...this.items[idx], ...data, updatedAt: new Date().toISOString() };
        return this.items[idx];
    }
    async delete(id) {
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1)
            return false;
        this.items.splice(idx, 1);
        return true;
    }
}
exports.MockInventoryRepository = MockInventoryRepository;
//# sourceMappingURL=inventory.repository.js.map