import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createWarehouseRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('inventory:read'), async (_req, res) => {
    try {
      const warehouses = await repos.warehouses.getWarehouses();
      res.json({ success: true, data: warehouses });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.post('/', authorize('inventory:write'), async (req, res) => {
    try {
      const wh = await repos.warehouses.createWarehouse(req.body);
      res.status(201).json({ success: true, data: wh });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.get('/movements', authorize('inventory:read'), async (req, res) => {
    try {
      const movements = await repos.warehouses.getMovements({
        warehouseId: req.query.warehouseId as string,
        inventoryItemId: req.query.inventoryItemId as string,
        type: req.query.type as string,
      });
      res.json({ success: true, data: movements });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.post('/movements', authorize('inventory:write'), async (req, res) => {
    try {
      const user = await repos.users.findById(req.user!.userId);
      const mv = await repos.warehouses.addMovement({
        ...req.body,
        userId: req.user!.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      res.status(201).json({ success: true, data: mv });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  return router;
}
