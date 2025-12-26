import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // assumes req.user set by JWT middleware
  // if you don't have such middleware yet, plug it before this
  // for now, treat presence of any authorization header as auth in stub
  if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

export function requireRoles(...roles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
