import { Router } from 'express';
import bcrypt from 'bcryptjs';
import type { Repositories } from '../repositories/index.js';
import { generateToken, authenticate } from '../middleware/auth.js';

export function createAuthRoutes(repos: Repositories): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email a heslo jsou povinné' });
        return;
      }

      const user = await repos.users.findByEmail(email);
      if (!user || !user.isActive) {
        res.status(401).json({ success: false, error: 'Neplatné přihlašovací údaje' });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Neplatné přihlašovací údaje' });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { passwordHash: _, ...safeUser } = user;
      res.json({ success: true, data: { token, user: safeUser } });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/me', authenticate, async (req, res) => {
    try {
      const user = await repos.users.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'Uživatel nenalezen' });
        return;
      }
      const { passwordHash: _, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}
