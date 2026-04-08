"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuickNoteRoutes = createQuickNoteRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createQuickNoteRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', async (req, res) => {
        try {
            const notes = await repos.quickNotes.findByUser(req.user.userId);
            res.json({ success: true, data: notes });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', async (req, res) => {
        try {
            const note = await repos.quickNotes.create({
                ...req.body,
                userId: req.user.userId,
            });
            res.status(201).json({ success: true, data: note });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', async (req, res) => {
        try {
            const note = await repos.quickNotes.update(req.params.id, req.body);
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
            const ok = await repos.quickNotes.delete(req.params.id);
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
//# sourceMappingURL=quicknotes.routes.js.map