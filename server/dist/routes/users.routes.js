"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRoutes = createUserRoutes;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_js_1 = require("../middleware/auth.js");
function createUserRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.requireRole)('root', 'team_leader'), async (_req, res) => {
        try {
            const users = await repos.users.findAll();
            const safe = users.map(({ passwordHash: _, ...u }) => u);
            res.json({ success: true, data: safe });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.requireRole)('root', 'team_leader'), async (req, res) => {
        try {
            const user = await repos.users.findById(req.params.id);
            if (!user) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const { passwordHash: _, ...safe } = user;
            res.json({ success: true, data: safe });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.requireRole)('root'), async (req, res) => {
        try {
            const { password, ...data } = req.body;
            const hash = await bcryptjs_1.default.hash(password, 10);
            const user = await repos.users.create({ ...data, passwordHash: hash });
            const { passwordHash: _, ...safe } = user;
            res.status(201).json({ success: true, data: safe });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.requireRole)('root'), async (req, res) => {
        try {
            const { password, ...data } = req.body;
            if (password)
                data.passwordHash = await bcryptjs_1.default.hash(password, 10);
            const user = await repos.users.update(req.params.id, data);
            if (!user) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const { passwordHash: _, ...safe } = user;
            res.json({ success: true, data: safe });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.requireRole)('root'), async (req, res) => {
        try {
            const ok = await repos.users.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Uživatel deaktivován' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=users.routes.js.map