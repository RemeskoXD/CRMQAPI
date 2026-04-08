import { Router } from 'express';
import bcrypt from 'bcryptjs';
import type { Repositories } from '../repositories/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export function createUserRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', requireRole('root', 'team_leader'), async (_req, res) => {
    try {
      const users = await repos.users.findAll();
      const safe = users.map(({ passwordHash: _, ...u }) => u);
      res.json({ success: true, data: safe });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', requireRole('root', 'team_leader'), async (req, res) => {
    try {
      const user = await repos.users.findById(req.params.id);
      if (!user) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      const { passwordHash: _, ...safe } = user;
      res.json({ success: true, data: safe });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', requireRole('root'), async (req, res) => {
    try {
      const { password, ...data } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const user = await repos.users.create({ ...data, passwordHash: hash });
      const { passwordHash: _, ...safe } = user;
      res.status(201).json({ success: true, data: safe });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.patch('/:id', requireRole('root'), async (req, res) => {
    try {
      const { password, ...data } = req.body;
      if (password) data.passwordHash = await bcrypt.hash(password, 10);
      const user = await repos.users.update(req.params.id, data);
      if (!user) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      const { passwordHash: _, ...safe } = user;
      res.json({ success: true, data: safe });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.delete('/:id', requireRole('root'), async (req, res) => {
    try {
      const ok = await repos.users.delete(req.params.id);
      if (!ok) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, message: 'Uživatel deaktivován' });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
