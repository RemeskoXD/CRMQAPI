import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate } from '../middleware/auth.js';

export function createLeadRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.assignedUserId) filters.assignedUserId = req.query.assignedUserId;
      if (req.user!.role === 'infoline') filters.assignedUserId = req.user!.userId;
      const leads = await repos.leads.findAll(filters);
      res.json({ success: true, data: leads });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.post('/', async (req, res) => {
    try {
      const lead = await repos.leads.create(req.body);
      res.status(201).json({ success: true, data: lead });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const lead = await repos.leads.update(req.params.id, req.body);
      if (!lead) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: lead });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await repos.leads.delete(req.params.id);
      res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: 'Chyba' }); }
  });

  return router;
}
