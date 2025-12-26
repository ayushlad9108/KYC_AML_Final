import { Router } from 'express';

const router = Router();

// Submit KYC document (stub)
router.post('/documents', (_req, res) => {
  res.json({ status: 'received', kycStatus: 'pending' });
});

// Get current KYC status (stub)
router.get('/status', (_req, res) => {
  res.json({ status: 'not_submitted' });
});

export default router;
