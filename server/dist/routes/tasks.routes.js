"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskRoutes = createTaskRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createTaskRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('tasks:read', 'tasks:update_own'), async (req, res) => {
        try {
            const filters = {};
            if (req.query.projectId)
                filters.projectId = req.query.projectId;
            if (req.query.assignedUserId)
                filters.assignedUserId = req.query.assignedUserId;
            if (req.query.status)
                filters.status = req.query.status;
            if (req.user.role === 'technician') {
                filters.assignedUserId = req.user.userId;
            }
            const tasks = await repos.tasks.findAll(filters);
            res.json({ success: true, data: tasks });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('tasks:read', 'tasks:update_own'), async (req, res) => {
        try {
            const task = await repos.tasks.findById(req.params.id);
            if (!task) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: task });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('tasks:write'), async (req, res) => {
        try {
            const task = await repos.tasks.create(req.body);
            res.status(201).json({ success: true, data: task });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('tasks:write', 'tasks:update_own'), async (req, res) => {
        try {
            if (req.user.role === 'technician') {
                const task = await repos.tasks.findById(req.params.id);
                if (!task || task.assignedUserId !== req.user.userId) {
                    res.status(403).json({ success: false, error: 'Přístup zamítnut' });
                    return;
                }
                const { status, notes, completedAt } = req.body;
                const updated = await repos.tasks.update(req.params.id, { status, notes, completedAt });
                res.json({ success: true, data: updated });
                return;
            }
            const task = await repos.tasks.update(req.params.id, req.body);
            if (!task) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: task });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('tasks:write'), async (req, res) => {
        try {
            const ok = await repos.tasks.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Úkol smazán' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=tasks.routes.js.map