"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDesktopRepository = void 0;
const uuid_1 = require("uuid");
const now = new Date().toISOString();
const mockDesktopItems = [
    { id: 'di1', userId: 'u1', type: 'folder', name: 'Dokumenty', position: 0, color: '#3B82F6', createdAt: now, updatedAt: now },
    { id: 'di2', userId: 'u1', type: 'file', name: 'Poznámky ke schůzce.txt', content: 'Body ke schůzce s Rezidencí Karlín:\n- Prezentace řešení pro podzemní garáže\n- 12 ks vrat - cenová nabídka\n- Termín realizace Q3 2026', parentId: 'di1', position: 0, createdAt: now, updatedAt: now },
    { id: 'di3', userId: 'u1', type: 'file', name: 'TODO.txt', content: '- Obnovit smlouvu se Somfy\n- Objednat pružiny (10 sad)\n- Připravit podklady pro audit', position: 1, createdAt: now, updatedAt: now },
    { id: 'di4', userId: 'u1', type: 'link', name: 'Google Analytics', url: 'https://analytics.google.com', icon: '📊', position: 2, createdAt: now, updatedAt: now },
];
class MockDesktopRepository {
    items = [...mockDesktopItems];
    async findByUser(userId, parentId) {
        return this.items
            .filter(i => i.userId === userId && (parentId ? i.parentId === parentId : !i.parentId))
            .sort((a, b) => a.position - b.position);
    }
    async findById(id) {
        return this.items.find(i => i.id === id) ?? null;
    }
    async create(data) {
        const item = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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
        // Delete item and all children
        const toDelete = new Set();
        const collectChildren = (parentId) => {
            this.items.filter(i => i.parentId === parentId).forEach(i => {
                toDelete.add(i.id);
                collectChildren(i.id);
            });
        };
        toDelete.add(id);
        collectChildren(id);
        this.items = this.items.filter(i => !toDelete.has(i.id));
        return true;
    }
}
exports.MockDesktopRepository = MockDesktopRepository;
//# sourceMappingURL=desktop.repository.js.map