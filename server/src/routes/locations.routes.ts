import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createLocationRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('clients:read'), async (req, res) => {
    try {
      const locations = await repos.locations.findAll(req.query.clientId as string);
      res.json({ success: true, data: locations });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', authorize('clients:read'), async (req, res) => {
    try {
      const location = await repos.locations.findById(req.params.id);
      if (!location) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: location });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('clients:write'), async (req, res) => {
    try {
      const location = await repos.locations.create(req.body);
      res.status(201).json({ success: true, data: location });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', authorize('clients:write'), async (req, res) => {
    try {
      const location = await repos.locations.update(req.params.id, req.body);
      if (!location) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: location });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', authorize('clients:write'), async (req, res) => {
    try {
      const ok = await repos.locations.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Místo smazáno' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
