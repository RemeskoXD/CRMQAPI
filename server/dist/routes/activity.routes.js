"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityRoutes = createActivityRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createActivityRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', async (req, res) => {
        try {
            const entries = await repos.activity.findAll({
                userId: req.query.userId,
                entityType: req.query.entityType,
                limit: req.query.limit ? parseInt(req.query.limit) : 20,
            });
            res.json({ success: true, data: entries });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=activity.routes.js.map