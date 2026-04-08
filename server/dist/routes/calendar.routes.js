"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalendarRoutes = createCalendarRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createCalendarRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('calendar:read', 'calendar:read_own'), async (req, res) => {
        try {
            const filters = {};
            if (req.query.from)
                filters.from = req.query.from;
            if (req.query.to)
                filters.to = req.query.to;
            if (req.user.role === 'technician') {
                filters.userId = req.user.userId;
            }
            else if (req.query.userId) {
                filters.userId = req.query.userId;
            }
            const events = await repos.calendarEvents.findAll(filters);
            res.json({ success: true, data: events });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('calendar:write'), async (req, res) => {
        try {
            const event = await repos.calendarEvents.create(req.body);
            res.status(201).json({ success: true, data: event });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('calendar:write'), async (req, res) => {
        try {
            const event = await repos.calendarEvents.update(req.params.id, req.body);
            if (!event) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: event });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('calendar:write'), async (req, res) => {
        try {
            const ok = await repos.calendarEvents.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Událost smazána' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=calendar.routes.js.map