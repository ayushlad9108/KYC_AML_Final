import prisma from '@/utils/prisma';
import redisClient from '@/utils/redis';
import { DashboardMetrics, ActivityItem } from '@/types';

export class DashboardService {
  // Get dashboard metrics with caching
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Try to get cached metrics first
    const cachedMetrics = await redisClient.getDashboardMetrics();
    if (cachedMetrics) {
      return cachedMetrics;
    }

    // Calculate metrics from database
    const metrics = await this.calculateDashboardMetrics();

    // Cache metrics for 5 minutes
    await redisClient.cacheDashboardMetrics(metrics, 300);

    return metrics;
  }

  // Calculate dashboard metrics from database
  private async calculateDashboardMetrics(): Promise<DashboardMetrics> {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get active KYC verifications count
    const activeKYCVerifications = await prisma.kYCVerification.count({
      where: {
        verificationStatus: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    });

    // Get pending AML alerts count
    const pendingAMLAlerts = await prisma.aMLAlert.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    });

    // Get risk distribution
    const riskDistribution = await this.getRiskDistribution();

    // Calculate compliance score
    const complianceScore = await this.calculateComplianceScore();

    // Get recent activity
    const recentActivity = await this.getRecentActivity();

    return {
      totalUsers,
      activeKYCVerifications,
      pendingAMLAlerts,
      riskDistribution,
      complianceScore,
      recentActivity,
    };
  }

  // Get risk distribution of users
  private async getRiskDistribution(): Promise<{
    low: number;
    medium: number;
    high: number;
    critical: number;
  }> {
    const riskCounts = await prisma.user.groupBy({
      by: ['riskScore'],
      _count: {
        riskScore: true,
      },
    });

    let low = 0, medium = 0, high = 0, critical = 0;

    riskCounts.forEach(({ riskScore, _count }) => {
      if (riskScore < 30) {
        low += _count.riskScore;
      } else if (riskScore < 60) {
        medium += _count.riskScore;
      } else if (riskScore < 80) {
        high += _count.riskScore;
      } else {
        critical += _count.riskScore;
      }
    });

    return { low, medium, high, critical };
  }

  // Calculate overall compliance score
  private async calculateComplianceScore(): Promise<number> {
    // Get total alerts in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalAlerts = await prisma.aMLAlert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get resolved alerts in the last 30 days
    const resolvedAlerts = await prisma.aMLAlert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: 'RESOLVED',
      },
    });

    // Get false positive rate
    const falsePositives = await prisma.aMLAlert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        falsePositive: true,
      },
    });

    // Calculate compliance score based on resolution rate and false positive rate
    let score = 100;

    if (totalAlerts > 0) {
      const resolutionRate = (resolvedAlerts / totalAlerts) * 100;
      const falsePositiveRate = (falsePositives / totalAlerts) * 100;

      // Adjust score based on resolution rate (higher is better)
      score = resolutionRate;

      // Penalize for high false positive rate
      if (falsePositiveRate > 20) {
        score -= (falsePositiveRate - 20) * 2;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Get recent activity items
  private async getRecentActivity(): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get recent KYC verifications
    const recentKYC = await prisma.kYCVerification.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    recentKYC.forEach(kyc => {
      activities.push({
        id: kyc.id,
        type: 'kyc',
        description: `KYC verification ${kyc.verificationStatus.toLowerCase()} for ${kyc.user.profile?.firstName} ${kyc.user.profile?.lastName}`,
        timestamp: kyc.createdAt.toISOString(),
        userId: kyc.userId,
      });
    });

    // Get recent AML alerts
    const recentAlerts = await prisma.aMLAlert.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    recentAlerts.forEach(alert => {
      activities.push({
        id: alert.id,
        type: 'aml',
        description: `${alert.alertType} alert created for ${alert.user.profile?.firstName} ${alert.user.profile?.lastName}`,
        timestamp: alert.createdAt.toISOString(),
        severity: alert.severity,
        userId: alert.userId,
      });
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    recentTransactions.forEach(transaction => {
      activities.push({
        id: transaction.id,
        type: 'transaction',
        description: `${transaction.transactionType.toLowerCase()} of ₹${transaction.amount.toLocaleString()} by ${transaction.user.profile?.firstName} ${transaction.user.profile?.lastName}`,
        timestamp: transaction.createdAt.toISOString(),
        userId: transaction.userId,
      });
    });

    // Sort all activities by timestamp (most recent first) and take top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  // Get user statistics
  async getUserStatistics(): Promise<any> {
    const totalUsers = await prisma.user.count();
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const usersByKYCStatus = await prisma.user.groupBy({
      by: ['kycStatus'],
      _count: {
        kycStatus: true,
      },
    });

    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      newUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
      usersByStatus: usersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      usersByKYCStatus: usersByKYCStatus.reduce((acc, item) => {
        acc[item.kycStatus] = item._count.kycStatus;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Get transaction statistics
  async getTransactionStatistics(): Promise<any> {
    const totalTransactions = await prisma.transaction.count();

    // Get transactions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get total transaction volume
    const totalVolume = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Get recent transaction volume
    const recentVolume = await prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get transactions by type
    const transactionsByType = await prisma.transaction.groupBy({
      by: ['transactionType'],
      _count: {
        transactionType: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Get transactions by AML status
    const transactionsByAMLStatus = await prisma.transaction.groupBy({
      by: ['amlStatus'],
      _count: {
        amlStatus: true,
      },
    });

    return {
      totalTransactions,
      recentTransactions,
      totalVolume: totalVolume._sum.amount || 0,
      recentVolume: recentVolume._sum.amount || 0,
      transactionsByType: transactionsByType.reduce((acc, item) => {
        acc[item.transactionType] = {
          count: item._count.transactionType,
          volume: item._sum.amount || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; volume: number }>),
      transactionsByAMLStatus: transactionsByAMLStatus.reduce((acc, item) => {
        acc[item.amlStatus] = item._count.amlStatus;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Get AML statistics
  async getAMLStatistics(): Promise<any> {
    const totalAlerts = await prisma.aMLAlert.count();

    // Get alerts in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAlerts = await prisma.aMLAlert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get alerts by severity
    const alertsBySeverity = await prisma.aMLAlert.groupBy({
      by: ['severity'],
      _count: {
        severity: true,
      },
    });

    // Get alerts by status
    const alertsByStatus = await prisma.aMLAlert.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Get false positive rate
    const falsePositives = await prisma.aMLAlert.count({
      where: {
        falsePositive: true,
      },
    });

    const falsePositiveRate = totalAlerts > 0 ? (falsePositives / totalAlerts) * 100 : 0;

    // Get average resolution time (for resolved alerts)
    const resolvedAlerts = await prisma.aMLAlert.findMany({
      where: {
        status: 'RESOLVED',
        resolvedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let averageResolutionTime = 0;
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        const resolutionTime = alert.resolvedAt!.getTime() - alert.createdAt.getTime();
        return sum + resolutionTime;
      }, 0);
      averageResolutionTime = totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      totalAlerts,
      recentAlerts,
      falsePositiveRate: Math.round(falsePositiveRate * 100) / 100,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      alertsBySeverity: alertsBySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count.severity;
        return acc;
      }, {} as Record<string, number>),
      alertsByStatus: alertsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Clear dashboard cache
  async clearDashboardCache(): Promise<void> {
    await redisClient.del('dashboard:metrics');
  }
}