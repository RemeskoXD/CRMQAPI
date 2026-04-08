"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRoutes = createClientRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createClientRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('clients:read'), async (req, res) => {
        try {
            const clients = await repos.clients.findAll({
                search: req.query.search,
                type: req.query.type,
                assignedUserId: req.query.assignedUserId,
            });
            res.json({ success: true, data: clients });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('clients:read'), async (req, res) => {
        try {
            const client = await repos.clients.findById(req.params.id);
            if (!client) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const [locations, projects, invoices, tasks, notes] = await Promise.all([
                repos.locations.findAll(req.params.id),
                repos.projects.findAll({ clientId: req.params.id }),
                repos.invoices.findAll({ clientId: req.params.id }),
                repos.tasks.findAll({ clientId: req.params.id }),
                repos.notes.findByEntity('client', req.params.id),
            ]);
            res.json({ success: true, data: { ...client, locations, projects, invoices, tasks, notes } });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const client = await repos.clients.create(req.body);
            res.status(201).json({ success: true, data: client });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const client = await repos.clients.update(req.params.id, req.body);
            if (!client) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: client });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const ok = await repos.clients.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Klient smazán' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=clients.routes.js.map