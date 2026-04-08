import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createCalendarRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('calendar:read', 'calendar:read_own'), async (req, res) => {
    try {
      const filters: { userId?: string; from?: string; to?: string } = {};
      if (req.query.from) filters.from = req.query.from as string;
      if (req.query.to) filters.to = req.query.to as string;

      if (req.user!.role === 'technician') {
        filters.userId = req.user!.userId;
      } else if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }

      const events = await repos.calendarEvents.findAll(filters);
      res.json({ success: true, data: events });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('calendar:write'), async (req, res) => {
    try {
      const event = await repos.calendarEvents.create(req.body);
      res.status(201).json({ success: true, data: event });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', authorize('calendar:write'), async (req, res) => {
    try {
      const event = await repos.calendarEvents.update(req.params.id, req.body);
      if (!event) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: event });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', authorize('calendar:write'), async (req, res) => {
    try {
      const ok = await repos.calendarEvents.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Událost smazána' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
