"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLeadRepository = void 0;
const uuid_1 = require("uuid");
const now = new Date().toISOString();
const day = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString(); };
const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
const mockLeads = [
    { id: 'ld1', clientName: 'Tomáš Konečný', phone: '+420 777 111 222', email: 'tomas.k@email.cz', source: 'Google Ads', status: 'new', assignedUserId: 'u7', assignedUserName: 'Lucie Černá', nextCallAt: day(0), createdAt: ago(2), updatedAt: ago(2) },
    { id: 'ld2', clientName: 'Bytový dům Vinohrady', phone: '+420 777 333 444', source: 'Webový formulář', status: 'new', assignedUserId: 'u7', assignedUserName: 'Lucie Černá', nextCallAt: day(0), createdAt: ago(5), updatedAt: ago(5) },
    { id: 'ld3', clientName: 'Ing. Pavel Kříž', phone: '+420 777 555 666', email: 'kriz@firma.cz', source: 'Doporučení', status: 'contacted', assignedUserId: 'u7', assignedUserName: 'Lucie Černá', lastContactedAt: ago(3), nextCallAt: day(1), notes: 'Zajímá se o garážová vrata, zavolat znova', createdAt: ago(24), updatedAt: ago(3) },
    { id: 'ld4', clientName: 'Autoservis Nový s.r.o.', phone: '+420 777 777 888', source: 'Facebook', status: 'qualified', assignedUserId: 'u3', assignedUserName: 'Andrej Kováč', lastContactedAt: ago(12), notes: 'Poptávka na 3 sekční vrata, poslat nabídku', createdAt: ago(48), updatedAt: ago(12) },
    { id: 'ld5', clientName: 'Marie Sedláčková', phone: '+420 777 999 000', source: 'qapi.cz', status: 'contacted', assignedUserId: 'u7', assignedUserName: 'Lucie Černá', lastContactedAt: ago(8), nextCallAt: day(2), notes: 'Výměna oken v RD, chce zaměření', createdAt: ago(72), updatedAt: ago(8) },
    { id: 'ld6', clientName: 'Petr Holub', phone: '+420 608 123 456', source: 'Seznam SKLIK', status: 'new', assignedUserId: 'u7', assignedUserName: 'Lucie Černá', nextCallAt: day(0), createdAt: ago(1), updatedAt: ago(1) },
];
class MockLeadRepository {
    leads = [...mockLeads];
    async findAll(filters) {
        let result = [...this.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (filters?.status)
            result = result.filter(l => l.status === filters.status);
        if (filters?.assignedUserId)
            result = result.filter(l => l.assignedUserId === filters.assignedUserId);
        return result;
    }
    async findById(id) {
        return this.leads.find(l => l.id === id) ?? null;
    }
    async create(data) {
        const lead = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        this.leads.push(lead);
        return lead;
    }
    async update(id, data) {
        const idx = this.leads.findIndex(l => l.id === id);
        if (idx === -1)
            return null;
        this.leads[idx] = { ...this.leads[idx], ...data, updatedAt: new Date().toISOString() };
        return this.leads[idx];
    }
    async delete(id) {
        const idx = this.leads.findIndex(l => l.id === id);
        if (idx === -1)
            return false;
        this.leads.splice(idx, 1);
        return true;
    }
}
exports.MockLeadRepository = MockLeadRepository;
//# sourceMappingURL=lead.repository.js.map