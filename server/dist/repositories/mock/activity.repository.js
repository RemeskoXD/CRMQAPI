"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockActivityRepository = void 0;
const uuid_1 = require("uuid");
const ago = (hours) => new Date(Date.now() - hours * 3600000).toISOString();
const mockActivity = [
    { id: 'a1', userId: 'u3', userName: 'Andrej Kováč', entityType: 'project', entityId: 'p1', entityTitle: 'Sekční vrata - Dejvice', action: 'status_changed', details: 'Změněno na "Realizace"', createdAt: ago(2) },
    { id: 'a2', userId: 'u4', userName: 'Petr Dvořák', entityType: 'task', entityId: 't1', entityTitle: 'Montáž vodících lišt', action: 'status_changed', details: 'Zahájeno', createdAt: ago(3) },
    { id: 'a3', userId: 'u3', userName: 'Andrej Kováč', entityType: 'project', entityId: 'p4', entityTitle: 'Venkovní žaluzie - Plzeň', action: 'created', createdAt: ago(5) },
    { id: 'a4', userId: 'u7', userName: 'Lucie Černá', entityType: 'client', entityId: 'c5', entityTitle: 'Rezidence Karlín s.r.o.', action: 'created', createdAt: ago(8) },
    { id: 'a5', userId: 'u5', userName: 'Jana Svobodová', entityType: 'task', entityId: 't4', entityTitle: 'Kontrola stavební připravenosti', action: 'status_changed', details: 'Dokončeno', createdAt: ago(10) },
    { id: 'a6', userId: 'u3', userName: 'Andrej Kováč', entityType: 'invoice', entityId: 'inv1', entityTitle: 'CN-2026-001', action: 'created', details: 'Cenová nabídka pro Stavby Praha', createdAt: ago(12) },
    { id: 'a7', userId: 'u2', userName: 'Marek Novák', entityType: 'project', entityId: 'p5', entityTitle: 'Garážová vrata - Rezidence Karlín', action: 'assigned', details: 'Přiřazeno k řešení', createdAt: ago(14) },
    { id: 'a8', userId: 'u4', userName: 'Petr Dvořák', entityType: 'project', entityId: 'p1', entityTitle: 'Sekční vrata - Dejvice', action: 'comment_added', details: 'Stavební připravenost OK', createdAt: ago(16) },
    { id: 'a9', userId: 'u1', userName: 'Admin Root', entityType: 'client', entityId: 'c4', entityTitle: 'Marie Horáková', action: 'updated', details: 'Aktualizovány kontaktní údaje', createdAt: ago(20) },
    { id: 'a10', userId: 'u8', userName: 'Martin Veselý', entityType: 'invoice', entityId: 'inv3', entityTitle: 'FA-2026-001', action: 'status_changed', details: 'Označeno jako zaplacené', createdAt: ago(24) },
];
class MockActivityRepository {
    log = [...mockActivity];
    async findAll(filters) {
        let result = [...this.log].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (filters?.userId)
            result = result.filter(e => e.userId === filters.userId);
        if (filters?.entityType)
            result = result.filter(e => e.entityType === filters.entityType);
        if (filters?.limit)
            result = result.slice(0, filters.limit);
        return result;
    }
    async create(data) {
        const entry = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date().toISOString() };
        this.log.push(entry);
        return entry;
    }
}
exports.MockActivityRepository = MockActivityRepository;
//# sourceMappingURL=activity.repository.js.map