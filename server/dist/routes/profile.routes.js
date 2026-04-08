"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileRoutes = createProfileRoutes;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_js_1 = require("../middleware/auth.js");
function createProfileRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', async (req, res) => {
        try {
            const user = await repos.users.findById(req.user.userId);
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
    router.patch('/', async (req, res) => {
        try {
            const { firstName, lastName, phone, avatarUrl } = req.body;
            const updated = await repos.users.update(req.user.userId, {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone !== undefined && { phone }),
                ...(avatarUrl !== undefined && { avatarUrl }),
            });
            if (!updated) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const { passwordHash: _, ...safe } = updated;
            res.json({ success: true, data: safe });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/change-password', async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ success: false, error: 'Vyplňte obě hesla' });
                return;
            }
            if (newPassword.length < 6) {
                res.status(400).json({ success: false, error: 'Nové heslo musí mít alespoň 6 znaků' });
                return;
            }
            const user = await repos.users.findById(req.user.userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!valid) {
                res.status(400).json({ success: false, error: 'Aktuální heslo nesouhlasí' });
                return;
            }
            const hash = await bcryptjs_1.default.hash(newPassword, 10);
            await repos.users.update(req.user.userId, { passwordHash: hash });
            res.json({ success: true, message: 'Heslo bylo změněno' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=profile.routes.js.map