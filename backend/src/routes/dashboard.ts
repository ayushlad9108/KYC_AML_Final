import { Router, Response } from 'express';
import { DashboardService } from '@/services/dashboardService';
import { authenticate, analystOnly } from '@/middleware/auth';
import { generalRateLimit } from '@/middleware/rateLimit';
import { AuthenticatedRequest, ApiResponse } from '@/types';

const router = Router();
const dashboardService = new DashboardService();

// Apply authentication and rate limiting to all dashboard routes
router.use(authenticate);
router.use(analystOnly); // Only analysts and above can access dashboard
router.use(generalRateLimit);

// GET /api/dashboard/metrics - Get main dashboard metrics
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = await dashboardService.getDashboardMetrics();

    const response: ApiResponse<typeof metrics> = {
      success: true,
      data: metrics,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'DASHBOARD_METRICS_ERROR',
        message: error.message || 'Failed to get dashboard metrics',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
  }
});

// GET /api/dashboard/users - Get user statistics
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userStats = await dashboardService.getUserStatistics();

    const response: ApiResponse<typeof userStats> = {
      success: true,
      data: userStats,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'USER_STATS_ERROR',
        message: error.message || 'Failed to get user statistics',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
  }
});

// GET /api/dashboard/transactions - Get transaction statistics
router.get('/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactionStats = await dashboardService.getTransactionStatistics();

    const response: ApiResponse<typeof transactionStats> = {
      success: true,
      data: transactionStats,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'TRANSACTION_STATS_ERROR',
        message: error.message || 'Failed to get transaction statistics',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
  }
});

// GET /api/dashboard/aml - Get AML statistics
router.get('/aml', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const amlStats = await dashboardService.getAMLStatistics();

    const response: ApiResponse<typeof amlStats> = {
      success: true,
      data: amlStats,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'AML_STATS_ERROR',
        message: error.message || 'Failed to get AML statistics',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
  }
});

// POST /api/dashboard/refresh - Refresh dashboard cache
router.post('/refresh', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dashboardService.clearDashboardCache();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Dashboard cache cleared successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code || 'CACHE_REFRESH_ERROR',
        message: error.message || 'Failed to refresh dashboard cache',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
  }
});

export default router;