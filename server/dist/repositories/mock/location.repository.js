"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLocationRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockLocationRepository {
    locations = [...mock_data_js_1.mockLocations];
    async findAll(clientId) {
        if (clientId)
            return this.locations.filter(l => l.clientId === clientId);
        return [...this.locations];
    }
    async findById(id) {
        return this.locations.find(l => l.id === id) ?? null;
    }
    async create(data) {
        const location = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.locations.push(location);
        return location;
    }
    async update(id, data) {
        const idx = this.locations.findIndex(l => l.id === id);
        if (idx === -1)
            return null;
        this.locations[idx] = { ...this.locations[idx], ...data, updatedAt: new Date().toISOString() };
        return this.locations[idx];
    }
    async delete(id) {
        const idx = this.locations.findIndex(l => l.id === id);
        if (idx === -1)
            return false;
        this.locations.splice(idx, 1);
        return true;
    }
}
exports.MockLocationRepository = MockLocationRepository;
//# sourceMappingURL=location.repository.js.map