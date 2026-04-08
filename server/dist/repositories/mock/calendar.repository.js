"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockCalendarEventRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockCalendarEventRepository {
    events = [...mock_data_js_1.mockCalendarEvents];
    async findAll(filters) {
        let result = [...this.events];
        if (filters?.userId)
            result = result.filter(e => e.userId === filters.userId);
        if (filters?.from)
            result = result.filter(e => e.start >= filters.from);
        if (filters?.to)
            result = result.filter(e => e.end <= filters.to);
        return result;
    }
    async findById(id) {
        return this.events.find(e => e.id === id) ?? null;
    }
    async create(data) {
        const event = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.events.push(event);
        return event;
    }
    async update(id, data) {
        const idx = this.events.findIndex(e => e.id === id);
        if (idx === -1)
            return null;
        this.events[idx] = { ...this.events[idx], ...data, updatedAt: new Date().toISOString() };
        return this.events[idx];
    }
    async delete(id) {
        const idx = this.events.findIndex(e => e.id === id);
        if (idx === -1)
            return false;
        this.events.splice(idx, 1);
        return true;
    }
}
exports.MockCalendarEventRepository = MockCalendarEventRepository;
//# sourceMappingURL=calendar.repository.js.map