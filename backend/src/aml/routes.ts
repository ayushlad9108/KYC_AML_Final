import { Router } from 'express';

const router = Router();

// Ingest transactions (stub)
router.post('/ingest', (_req, res) => {
  res.json({ ingested: true, alertsCreated: 0 });
});

// List alerts (stub)
router.get('/alerts', (_req, res) => {
  res.json({ alerts: [] });
});

// Analyst decision (stub)
router.post('/alerts/:id/decision', (req, res) => {
  res.json({ id: req.params.id, decision: req.body?.decision || 'review', saved: true });
});

export default router;
