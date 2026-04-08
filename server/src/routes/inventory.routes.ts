import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createInventoryRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('inventory:read'), async (req, res) => {
    try {
      const items = await repos.inventory.findAll({
        category: req.query.category as string,
        search: req.query.search as string,
      });
      res.json({ success: true, data: items });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', authorize('inventory:read'), async (req, res) => {
    try {
      const item = await repos.inventory.findById(req.params.id);
      if (!item) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: item });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('inventory:write'), async (req, res) => {
    try {
      const item = await repos.inventory.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', authorize('inventory:write'), async (req, res) => {
    try {
      const item = await repos.inventory.update(req.params.id, req.body);
      if (!item) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: item });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', authorize('inventory:write'), async (req, res) => {
    try {
      const ok = await repos.inventory.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Položka smazána' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
