"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationRoutes = createLocationRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createLocationRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('clients:read'), async (req, res) => {
        try {
            const locations = await repos.locations.findAll(req.query.clientId);
            res.json({ success: true, data: locations });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('clients:read'), async (req, res) => {
        try {
            const location = await repos.locations.findById(req.params.id);
            if (!location) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: location });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const location = await repos.locations.create(req.body);
            res.status(201).json({ success: true, data: location });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const location = await repos.locations.update(req.params.id, req.body);
            if (!location) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: location });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('clients:write'), async (req, res) => {
        try {
            const ok = await repos.locations.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Místo smazáno' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=locations.routes.js.map