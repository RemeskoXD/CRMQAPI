import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createMaterialRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/project/:projectId', async (req, res) => {
    try {
      const materials = await repos.materials.findByProject(req.params.projectId);
      res.json({ success: true, data: materials });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const user = await repos.users.findById(req.user!.userId);
      const material = await repos.materials.create({
        ...req.body,
        addedByUserId: req.user!.userId,
        addedByName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      res.status(201).json({ success: true, data: material });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const ok = await repos.materials.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Materiál odebrán' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
