import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate } from '../middleware/auth.js';

export function createActivityRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    try {
      const entries = await repos.activity.findAll({
        userId: req.query.userId as string,
        entityType: req.query.entityType as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });
      res.json({ success: true, data: entries });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
