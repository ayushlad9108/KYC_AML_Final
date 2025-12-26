import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtUser {
  sub: string;
  role: 'customer' | 'analyst' | 'compliance_officer' | 'admin';
}

export function verifyJwt(req: Request & { user?: JwtUser }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as any;
    req.user = { sub: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
