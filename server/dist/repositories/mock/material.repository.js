"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMaterialRepository = void 0;
const uuid_1 = require("uuid");
const now = new Date().toISOString();
const mockMaterial = [
    { id: 'm1', projectId: 'p1', inventoryItemId: 'inv-i1', description: 'Hörmann LPU 42 - standardní', quantity: 2, unit: 'ks', unitPrice: 62000, totalPrice: 124000, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
    { id: 'm2', projectId: 'p1', inventoryItemId: 'inv-i2', description: 'Hörmann SupraMatic - pohon', quantity: 2, unit: 'ks', unitPrice: 18000, totalPrice: 36000, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
    { id: 'm3', projectId: 'p6', inventoryItemId: 'inv-i3', description: 'Pružiny torzní - sada', quantity: 1, unit: 'sada', unitPrice: 4500, totalPrice: 4500, addedByUserId: 'u4', addedByName: 'Petr Dvořák', createdAt: now },
    { id: 'm4', projectId: 'p4', inventoryItemId: 'inv-i5', description: 'Žaluzie C80 ALU', quantity: 6, unit: 'ks', unitPrice: 12000, totalPrice: 72000, addedByUserId: 'u3', addedByName: 'Andrej Kováč', createdAt: now },
    { id: 'm5', projectId: 'p4', inventoryItemId: 'inv-i6', description: 'Somfy io motor', quantity: 6, unit: 'ks', unitPrice: 5500, totalPrice: 33000, addedByUserId: 'u3', addedByName: 'Andrej Kováč', createdAt: now },
];
class MockMaterialRepository {
    materials = [...mockMaterial];
    async findByProject(projectId) {
        return this.materials.filter(m => m.projectId === projectId);
    }
    async create(data) {
        const item = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date().toISOString() };
        this.materials.push(item);
        return item;
    }
    async delete(id) {
        const idx = this.materials.findIndex(m => m.id === id);
        if (idx === -1)
            return false;
        this.materials.splice(idx, 1);
        return true;
    }
}
exports.MockMaterialRepository = MockMaterialRepository;
//# sourceMappingURL=material.repository.js.map