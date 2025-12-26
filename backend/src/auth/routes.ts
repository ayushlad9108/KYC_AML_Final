import { Router } from 'express';
import { z } from 'zod';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { User } from './user.model';
import { env } from '../config/env';
import { verifyJwt } from '../middleware/jwt';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'analyst', 'compliance_officer', 'admin']).optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, role = 'customer' } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const user = await User.create({ email, password, role });
  const access = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET as Secret,
    { expiresIn: env.JWT_ACCESS_TTL } as SignOptions
  );
  const refresh = jwt.sign(
    { sub: user.id },
    env.JWT_REFRESH_SECRET as Secret,
    { expiresIn: env.JWT_REFRESH_TTL } as SignOptions
  );
  return res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    token: access,
    refreshToken: refresh,
  });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const access = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET as Secret,
    { expiresIn: env.JWT_ACCESS_TTL } as SignOptions
  );
  const refresh = jwt.sign(
    { sub: user.id },
    env.JWT_REFRESH_SECRET as Secret,
    { expiresIn: env.JWT_REFRESH_TTL } as SignOptions
  );
  res.json({ token: access, refreshToken: refresh, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/refresh', async (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as any;
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
    const access = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_ACCESS_SECRET as Secret,
      { expiresIn: env.JWT_ACCESS_TTL } as SignOptions
    );
    res.json({ token: access });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;

// Authenticated profile
router.get('/me', verifyJwt, async (req, res) => {
  // @ts-expect-error user injected by verifyJwt
  const userId = req.user?.sub as string;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role, status: user.status });
});
