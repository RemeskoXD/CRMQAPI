import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createProjectRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('projects:read', 'projects:read_assigned'), async (req, res) => {
    try {
      const filters: Record<string, string> = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.clientId) filters.clientId = req.query.clientId as string;

      if (req.user!.role === 'technician') {
        filters.assignedTechnicianId = req.user!.userId;
      }

      const projects = await repos.projects.findAll(filters);
      res.json({ success: true, data: projects });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', authorize('projects:read', 'projects:read_assigned'), async (req, res) => {
    try {
      const project = await repos.projects.findById(req.params.id);
      if (!project) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }

      if (req.user!.role === 'technician' && project.assignedTechnicianId !== req.user!.userId) {
        res.status(403).json({ success: false, error: 'Přístup zamítnut' });
        return;
      }

      const [tasks, invoices, client, location, materials, notes] = await Promise.all([
        repos.tasks.findAll({ projectId: req.params.id }),
        repos.invoices.findAll({ projectId: req.params.id }),
        project.clientId ? repos.clients.findById(project.clientId) : null,
        project.locationId ? repos.locations.findById(project.locationId) : null,
        repos.materials.findByProject(req.params.id),
        repos.notes.findByEntity('project', req.params.id),
      ]);

      res.json({ success: true, data: { ...project, tasks, invoices, client, location, materials, notes } });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('projects:write', 'projects:create'), async (req, res) => {
    try {
      const project = await repos.projects.create(req.body);
      res.status(201).json({ success: true, data: project });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', authorize('projects:write'), async (req, res) => {
    try {
      const project = await repos.projects.update(req.params.id, req.body);
      if (!project) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: project });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', authorize('projects:write'), async (req, res) => {
    try {
      const ok = await repos.projects.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Zakázka smazána' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
