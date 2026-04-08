"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_js_1 = require("../middleware/auth.js");
function createAuthRoutes(repos) {
    const router = (0, express_1.Router)();
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, error: 'Email a heslo jsou povinné' });
                return;
            }
            const user = await repos.users.findByEmail(email);
            if (!user || !user.isActive) {
                res.status(401).json({ success: false, error: 'Neplatné přihlašovací údaje' });
                return;
            }
            const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!valid) {
                res.status(401).json({ success: false, error: 'Neplatné přihlašovací údaje' });
                return;
            }
            const token = (0, auth_js_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const { passwordHash: _, ...safeUser } = user;
            res.json({ success: true, data: { token, user: safeUser } });
        }
        catch (err) {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/me', auth_js_1.authenticate, async (req, res) => {
        try {
            const user = await repos.users.findById(req.user.userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'Uživatel nenalezen' });
                return;
            }
            const { passwordHash: _, ...safeUser } = user;
            res.json({ success: true, data: safeUser });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=auth.routes.js.map