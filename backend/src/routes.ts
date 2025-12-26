import { Router } from 'express';
import authRouter from './auth/routes';
import kycRouter from './kyc/routes';
import amlRouter from './aml/routes';
import analyticsRouter from './analytics/routes';
import reportsRouter from './reports/routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/kyc', kycRouter);
router.use('/aml', amlRouter);
router.use('/analytics', analyticsRouter);
router.use('/reports', reportsRouter);

export default router;
