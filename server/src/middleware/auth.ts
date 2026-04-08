import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthPayload, UserRole } from '../models/types.js';
import { ROLE_PERMISSIONS } from '../models/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'crmq-dev-secret-change-in-production';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const queryToken = req.query.token as string;

  let token: string | undefined;
  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Token není poskytnut' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Neplatný nebo expirovaný token' });
  }
}

export function authorize(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Neautorizovaný přístup' });
      return;
    }

    const userPerms = ROLE_PERMISSIONS[req.user.role];

    if (userPerms.includes('*')) {
      next();
      return;
    }

    const hasPermission = permissions.some(p => userPerms.includes(p));
    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Nedostatečná oprávnění' });
      return;
    }

    next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Neautorizovaný přístup' });
      return;
    }

    if (req.user.role === 'root' || roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ success: false, error: 'Nedostatečná oprávnění pro tuto roli' });
  };
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}
