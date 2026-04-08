"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProjectRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockProjectRepository {
    projects = [...mock_data_js_1.mockProjects];
    async findAll(filters) {
        let result = [...this.projects];
        if (filters?.status)
            result = result.filter(p => p.status === filters.status);
        if (filters?.type)
            result = result.filter(p => p.type === filters.type);
        if (filters?.clientId)
            result = result.filter(p => p.clientId === filters.clientId);
        if (filters?.assignedSalesId)
            result = result.filter(p => p.assignedSalesId === filters.assignedSalesId);
        if (filters?.assignedTechnicianId)
            result = result.filter(p => p.assignedTechnicianId === filters.assignedTechnicianId);
        return result;
    }
    async findById(id) {
        return this.projects.find(p => p.id === id) ?? null;
    }
    async create(data) {
        const project = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.projects.push(project);
        return project;
    }
    async update(id, data) {
        const idx = this.projects.findIndex(p => p.id === id);
        if (idx === -1)
            return null;
        this.projects[idx] = { ...this.projects[idx], ...data, updatedAt: new Date().toISOString() };
        return this.projects[idx];
    }
    async delete(id) {
        const idx = this.projects.findIndex(p => p.id === id);
        if (idx === -1)
            return false;
        this.projects.splice(idx, 1);
        return true;
    }
}
exports.MockProjectRepository = MockProjectRepository;
//# sourceMappingURL=project.repository.js.map