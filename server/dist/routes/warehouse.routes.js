"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWarehouseRoutes = createWarehouseRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createWarehouseRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('inventory:read'), async (_req, res) => {
        try {
            const warehouses = await repos.warehouses.getWarehouses();
            res.json({ success: true, data: warehouses });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('inventory:write'), async (req, res) => {
        try {
            const wh = await repos.warehouses.createWarehouse(req.body);
            res.status(201).json({ success: true, data: wh });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba' });
        }
    });
    router.get('/movements', (0, auth_js_1.authorize)('inventory:read'), async (req, res) => {
        try {
            const movements = await repos.warehouses.getMovements({
                warehouseId: req.query.warehouseId,
                inventoryItemId: req.query.inventoryItemId,
                type: req.query.type,
            });
            res.json({ success: true, data: movements });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba' });
        }
    });
    router.post('/movements', (0, auth_js_1.authorize)('inventory:write'), async (req, res) => {
        try {
            const user = await repos.users.findById(req.user.userId);
            const mv = await repos.warehouses.addMovement({
                ...req.body,
                userId: req.user.userId,
                userName: user ? `${user.firstName} ${user.lastName}` : undefined,
            });
            res.status(201).json({ success: true, data: mv });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba' });
        }
    });
    return router;
}
//# sourceMappingURL=warehouse.routes.js.map