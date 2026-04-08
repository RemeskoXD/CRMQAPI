import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate } from '../middleware/auth.js';

export function createDesktopRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    try {
      const parentId = req.query.parentId as string | undefined;
      const items = await repos.desktop.findByUser(req.user!.userId, parentId || undefined);
      res.json({ success: true, data: items });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const item = await repos.desktop.findById(req.params.id);
      if (!item || item.userId !== req.user!.userId) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: item });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.post('/', async (req, res) => {
    try {
      const existing = await repos.desktop.findByUser(req.user!.userId);
      const item = await repos.desktop.create({
        ...req.body,
        userId: req.user!.userId,
        position: req.body.position ?? existing.length,
      });
      res.status(201).json({ success: true, data: item });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const item = await repos.desktop.update(req.params.id, req.body);
      if (!item) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: item });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await repos.desktop.delete(req.params.id);
      res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  return router;
}
