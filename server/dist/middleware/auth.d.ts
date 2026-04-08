import type { Request, Response, NextFunction } from 'express';
import type { AuthPayload, UserRole } from '../models/types.js';
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function authorize(...permissions: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function generateToken(payload: AuthPayload): string;
//# sourceMappingURL=auth.d.ts.map