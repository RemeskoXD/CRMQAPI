"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryRoutes = createInventoryRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createInventoryRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('inventory:read'), async (req, res) => {
        try {
            const items = await repos.inventory.findAll({
                category: req.query.category,
                search: req.query.search,
            });
            res.json({ success: true, data: items });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('inventory:read'), async (req, res) => {
        try {
            const item = await repos.inventory.findById(req.params.id);
            if (!item) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: item });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('inventory:write'), async (req, res) => {
        try {
            const item = await repos.inventory.create(req.body);
            res.status(201).json({ success: true, data: item });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('inventory:write'), async (req, res) => {
        try {
            const item = await repos.inventory.update(req.params.id, req.body);
            if (!item) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: item });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('inventory:write'), async (req, res) => {
        try {
            const ok = await repos.inventory.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Položka smazána' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=inventory.routes.js.map