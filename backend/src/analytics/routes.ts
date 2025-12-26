import { Router } from 'express';

const router = Router();

router.get('/metrics', (_req, res) => {
  res.json({
    totalUsers: 0,
    kycSuccessRate: 0,
    suspiciousTransactions: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
  });
});

export default router;
