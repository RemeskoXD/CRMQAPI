"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTaskRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockTaskRepository {
    tasks = [...mock_data_js_1.mockTasks];
    async findAll(filters) {
        let result = [...this.tasks];
        if (filters?.projectId)
            result = result.filter(t => t.projectId === filters.projectId);
        if (filters?.clientId)
            result = result.filter(t => t.clientId === filters.clientId);
        if (filters?.assignedUserId)
            result = result.filter(t => t.assignedUserId === filters.assignedUserId);
        if (filters?.status)
            result = result.filter(t => t.status === filters.status);
        return result;
    }
    async findById(id) {
        return this.tasks.find(t => t.id === id) ?? null;
    }
    async create(data) {
        const task = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.tasks.push(task);
        return task;
    }
    async update(id, data) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1)
            return null;
        this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() };
        return this.tasks[idx];
    }
    async delete(id) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1)
            return false;
        this.tasks.splice(idx, 1);
        return true;
    }
}
exports.MockTaskRepository = MockTaskRepository;
//# sourceMappingURL=task.repository.js.map