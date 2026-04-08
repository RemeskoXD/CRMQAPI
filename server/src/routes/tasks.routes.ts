import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createTaskRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('tasks:read', 'tasks:update_own'), async (req, res) => {
    try {
      const filters: Record<string, string> = {};
      if (req.query.projectId) filters.projectId = req.query.projectId as string;
      if (req.query.assignedUserId) filters.assignedUserId = req.query.assignedUserId as string;
      if (req.query.status) filters.status = req.query.status as string;

      if (req.user!.role === 'technician') {
        filters.assignedUserId = req.user!.userId;
      }

      const tasks = await repos.tasks.findAll(filters);
      res.json({ success: true, data: tasks });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', authorize('tasks:read', 'tasks:update_own'), async (req, res) => {
    try {
      const task = await repos.tasks.findById(req.params.id);
      if (!task) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: task });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('tasks:write'), async (req, res) => {
    try {
      const task = await repos.tasks.create(req.body);
      res.status(201).json({ success: true, data: task });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', authorize('tasks:write', 'tasks:update_own'), async (req, res) => {
    try {
      if (req.user!.role === 'technician') {
        const task = await repos.tasks.findById(req.params.id);
        if (!task || task.assignedUserId !== req.user!.userId) {
          res.status(403).json({ success: false, error: 'Přístup zamítnut' });
          return;
        }
        const { status, notes, completedAt } = req.body;
        const updated = await repos.tasks.update(req.params.id, { status, notes, completedAt });
        res.json({ success: true, data: updated });
        return;
      }

      const task = await repos.tasks.update(req.params.id, req.body);
      if (!task) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: task });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', authorize('tasks:write'), async (req, res) => {
    try {
      const ok = await repos.tasks.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Úkol smazán' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
