import prisma from '@/utils/prisma';
import { 
  NotFoundError, 
  ValidationError,
  PaginationParams,
  FilterParams 
} from '@/types';
import { maskEmail, maskPhone, maskPAN, maskAadhaar } from '@/utils/auth';

export class UserService {
  // Get all users with pagination and filtering
  async getUsers(params: PaginationParams & FilterParams, requestingUserRole: string) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      role,
      kycStatus,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          profile: true,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          riskScore: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Mask sensitive data based on requesting user's role
    const maskedUsers = users.map(user => this.maskUserData(user, requestingUserRole));

    return {
      users: maskedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(userId: string, requestingUserRole: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        kycVerifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        amlAlerts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        riskScore: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        kycVerifications: true,
        transactions: {
          select: {
            id: true,
            transactionType: true,
            amount: true,
            currency: true,
            riskScore: true,
            amlStatus: true,
            createdAt: true,
          },
        },
        amlAlerts: {
          select: {
            id: true,
            alertType: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return this.maskUserData(user, requestingUserRole);
  }

  // Update user status (admin only)
  async updateUserStatus(userId: string, status: string, updatedBy: string) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
    
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        profile: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        riskScore: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'STATUS_UPDATED',
        actorId: updatedBy,
        actorType: 'USER',
        changes: {
          oldStatus: user.status,
          newStatus: status,
        },
        metadata: {
          source: 'admin_action',
        },
      },
    });

    return updatedUser;
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: string, updatedBy: string) {
    const validRoles = ['CUSTOMER', 'ANALYST', 'COMPLIANCE_OFFICER', 'ADMIN'];
    
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: {
        profile: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        riskScore: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'ROLE_UPDATED',
        actorId: updatedBy,
        actorType: 'USER',
        changes: {
          oldRole: user.role,
          newRole: role,
        },
        metadata: {
          source: 'admin_action',
        },
      },
    });

    return updatedUser;
  }

  // Get user activity (audit logs)
  async getUserActivity(userId: string, params: PaginationParams) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          OR: [
            { entityId: userId },
            { actorId: userId },
          ],
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          OR: [
            { entityId: userId },
            { actorId: userId },
          ],
        },
      }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Search users
  async searchUsers(query: string, requestingUserRole: string) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { profile: { firstName: { contains: query, mode: 'insensitive' } } },
          { profile: { lastName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: 10, // Limit search results
      include: {
        profile: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        riskScore: true,
        kycStatus: true,
        profile: true,
      },
    });

    return users.map(user => this.maskUserData(user, requestingUserRole));
  }

  // Mask sensitive user data based on requesting user's role
  private maskUserData(user: any, requestingUserRole: string) {
    // Admins and compliance officers can see all data
    if (['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'].includes(requestingUserRole)) {
      return user;
    }

    // Analysts can see most data but with some masking
    if (requestingUserRole === 'ANALYST') {
      return {
        ...user,
        email: maskEmail(user.email),
        phone: user.phone ? maskPhone(user.phone) : null,
      };
    }

    // Customers can only see very limited data
    return {
      id: user.id,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      } : null,
    };
  }

  // Get user risk assessment
  async getUserRiskAssessment(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 transactions for risk calculation
        },
        amlAlerts: {
          where: {
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
        },
        kycVerifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Calculate risk factors
    const riskFactors = {
      transactionVelocity: this.calculateTransactionVelocity(user.transactions),
      alertCount: user.amlAlerts.length,
      kycStatus: user.kycStatus,
      accountAge: this.calculateAccountAge(user.createdAt),
      transactionPatterns: this.analyzeTransactionPatterns(user.transactions),
    };

    return {
      userId: user.id,
      currentRiskScore: user.riskScore,
      riskFactors,
      lastUpdated: user.updatedAt,
      recommendations: this.generateRiskRecommendations(riskFactors),
    };
  }

  // Helper methods for risk assessment
  private calculateTransactionVelocity(transactions: any[]) {
    if (transactions.length === 0) return 0;

    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentTransactions = transactions.filter(
      tx => new Date(tx.createdAt) > last24Hours
    );

    return recentTransactions.length;
  }

  private calculateAccountAge(createdAt: Date) {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
  }

  private analyzeTransactionPatterns(transactions: any[]) {
    if (transactions.length === 0) return { unusual: false };

    const amounts = transactions.map(tx => parseFloat(tx.amount.toString()));
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const maxAmount = Math.max(...amounts);

    return {
      averageAmount: avgAmount,
      maxAmount,
      unusual: maxAmount > avgAmount * 10, // Flag if max is 10x average
    };
  }

  private generateRiskRecommendations(riskFactors: any) {
    const recommendations = [];

    if (riskFactors.transactionVelocity > 20) {
      recommendations.push('High transaction velocity detected - consider enhanced monitoring');
    }

    if (riskFactors.alertCount > 3) {
      recommendations.push('Multiple open alerts - requires immediate attention');
    }

    if (riskFactors.kycStatus !== 'APPROVED') {
      recommendations.push('KYC verification incomplete - restrict high-value transactions');
    }

    if (riskFactors.accountAge < 30) {
      recommendations.push('New account - apply enhanced due diligence');
    }

    if (riskFactors.transactionPatterns.unusual) {
      recommendations.push('Unusual transaction patterns detected - manual review recommended');
    }

    return recommendations;
  }
}