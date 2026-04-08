"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteRoutes = createNoteRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createNoteRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/:entityType/:entityId', async (req, res) => {
        try {
            const notes = await repos.notes.findByEntity(req.params.entityType, req.params.entityId);
            res.json({ success: true, data: notes });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', async (req, res) => {
        try {
            const user = await repos.users.findById(req.user.userId);
            const note = await repos.notes.create({
                ...req.body,
                userId: req.user.userId,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Neznámý',
                isPinned: req.body.isPinned || false,
            });
            await repos.activity.create({
                userId: req.user.userId,
                userName: user ? `${user.firstName} ${user.lastName}` : undefined,
                entityType: req.body.entityType,
                entityId: req.body.entityId,
                action: 'comment_added',
                details: req.body.content.slice(0, 100),
            });
            res.status(201).json({ success: true, data: note });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', async (req, res) => {
        try {
            const note = await repos.notes.update(req.params.id, req.body);
            if (!note) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: note });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', async (req, res) => {
        try {
            const ok = await repos.notes.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Poznámka smazána' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=notes.routes.js.map