import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/auth';
import { AuthenticatedRequest, AuthenticationError, AuthorizationError, UserRole } from '@/types';
import redisClient from '@/utils/redis';

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token
    const payload = verifyAccessToken(token);
    
    // Check if token is blacklisted (optional - for logout functionality)
    const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been revoked');
    }
    
    // Attach user info to request
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }
      
      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(403).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied',
        },
      });
    }
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      // Check if token is blacklisted
      const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
      if (!isBlacklisted) {
        req.user = payload;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user context
    next();
  }
};

// Admin only middleware
export const adminOnly = authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

// Compliance officer and above
export const complianceOnly = authorize([
  UserRole.COMPLIANCE_OFFICER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]);

// Analyst and above
export const analystOnly = authorize([
  UserRole.ANALYST,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]);

// Customer access (for KYC endpoints)
export const customerAccess = authorize([
  UserRole.CUSTOMER,
  UserRole.ANALYST,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]);

// Self-access middleware (user can only access their own data)
export const selfAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const userId = req.params.userId || req.params.id;
    
    // Admins and compliance officers can access any user's data
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER].includes(req.user.role)) {
      return next();
    }
    
    // Analysts can access data for investigation purposes (with some restrictions)
    if (req.user.role === UserRole.ANALYST) {
      // Add specific logic for analyst access if needed
      return next();
    }
    
    // Customers can only access their own data
    if (req.user.role === UserRole.CUSTOMER && req.user.userId !== userId) {
      throw new AuthorizationError('You can only access your own data');
    }
    
    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Access denied',
      },
    });
  }
};

// API key authentication (for external integrations)
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new AuthenticationError('API key required');
    }
    
    // In a real implementation, you would validate the API key against a database
    // For now, we'll use a simple check
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      throw new AuthenticationError('Invalid API key');
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'API_KEY_ERROR',
        message: 'Invalid or missing API key',
      },
    });
  }
};

// Session validation middleware
export const validateSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }
    
    // Check if session exists in Redis
    const sessionData = await redisClient.getSession(req.user.userId);
    
    if (!sessionData) {
      throw new AuthenticationError('Session expired or invalid');
    }
    
    // Update session activity
    await redisClient.setSession(req.user.userId, {
      ...sessionData,
      lastActivity: new Date().toISOString(),
    });
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'SESSION_ERROR',
        message: 'Session validation failed',
      },
    });
  }
};