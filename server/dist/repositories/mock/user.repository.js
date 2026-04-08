"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockUserRepository = void 0;
const uuid_1 = require("uuid");
const mock_data_js_1 = require("../mock-data.js");
class MockUserRepository {
    users = [...mock_data_js_1.mockUsers];
    async findAll() {
        return this.users.filter(u => u.isActive);
    }
    async findById(id) {
        return this.users.find(u => u.id === id) ?? null;
    }
    async findByEmail(email) {
        return this.users.find(u => u.email === email) ?? null;
    }
    async create(data) {
        const user = {
            ...data,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.users.push(user);
        return user;
    }
    async update(id, data) {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx === -1)
            return null;
        this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date().toISOString() };
        return this.users[idx];
    }
    async delete(id) {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx === -1)
            return false;
        this.users[idx].isActive = false;
        return true;
    }
}
exports.MockUserRepository = MockUserRepository;
//# sourceMappingURL=user.repository.js.map