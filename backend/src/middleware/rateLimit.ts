import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';
import { generateRateLimitKey } from '@/utils/auth';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  standardHeaders?: boolean; // Return rate limit info in headers
  legacyHeaders?: boolean; // Return rate limit info in X-RateLimit-* headers
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Create rate limiter middleware
export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = generateRateLimitKey(keyGenerator(req), 'general');
      const windowSeconds = Math.ceil(windowMs / 1000);
      
      const { allowed, remaining, resetTime } = await redisClient.checkRateLimit(
        key,
        max,
        windowSeconds
      );

      // Add rate limit headers
      if (standardHeaders) {
        res.set({
          'RateLimit-Limit': max.toString(),
          'RateLimit-Remaining': remaining.toString(),
          'RateLimit-Reset': new Date(resetTime).toISOString(),
        });
      }

      if (legacyHeaders) {
        res.set({
          'X-RateLimit-Limit': max.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        });
      }

      if (!allowed) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          },
        });
      }

      // Store original end function to track response status
      const originalEnd = res.end;
      res.end = function (chunk?: any, encoding?: any) {
        const statusCode = res.statusCode;
        
        // Skip counting based on options
        if (
          (skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400)
        ) {
          // Decrement the counter since we don't want to count this request
          redisClient.client.decr(key);
        }
        
        originalEnd.call(this, chunk, encoding);
      };

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // If Redis is down, allow the request to proceed
      next();
    }
  };
};

// Predefined rate limiters for different endpoints

// General API rate limiter
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later',
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: (req: Request) => {
    // Use email if provided, otherwise fall back to IP
    const email = req.body?.email;
    return email ? `auth:${email}` : `auth:ip:${req.ip}`;
  },
});

// Rate limiter for KYC document uploads
export const kycUploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 document uploads per hour
  message: 'Too many document uploads, please try again later',
  keyGenerator: (req: Request) => {
    const userId = req.user?.userId || req.ip;
    return `kyc_upload:${userId}`;
  },
});

// Rate limiter for AML alert creation
export const amlAlertRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 alerts per 5 minutes (for high-volume transaction monitoring)
  message: 'AML alert rate limit exceeded',
  keyGenerator: (req: Request) => `aml_alerts:${req.ip}`,
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

// Rate limiter for report generation
export const reportGenerationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reports per hour
  message: 'Too many report generation requests, please try again later',
  keyGenerator: (req: Request) => {
    const userId = req.user?.userId || req.ip;
    return `reports:${userId}`;
  },
});

// Rate limiter for search operations
export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please slow down',
  keyGenerator: (req: Request) => {
    const userId = req.user?.userId || req.ip;
    return `search:${userId}`;
  },
});

// Rate limiter for password reset
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return email ? `password_reset:${email}` : `password_reset:ip:${req.ip}`;
  },
});

// Dynamic rate limiter based on user role
export const roleBasedRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  
  let rateLimitOptions: RateLimitOptions;
  
  switch (userRole) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      rateLimitOptions = {
        windowMs: 15 * 60 * 1000,
        max: 1000, // Higher limit for admins
      };
      break;
    case 'COMPLIANCE_OFFICER':
      rateLimitOptions = {
        windowMs: 15 * 60 * 1000,
        max: 500, // Medium limit for compliance officers
      };
      break;
    case 'ANALYST':
      rateLimitOptions = {
        windowMs: 15 * 60 * 1000,
        max: 300, // Medium limit for analysts
      };
      break;
    case 'CUSTOMER':
    default:
      rateLimitOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100, // Standard limit for customers
      };
      break;
  }
  
  const rateLimiter = createRateLimit({
    ...rateLimitOptions,
    keyGenerator: (req: Request) => {
      const userId = req.user?.userId || req.ip;
      return `role_based:${userId}`;
    },
  });
  
  return rateLimiter(req, res, next);
};

// Burst protection for high-frequency endpoints
export const burstProtection = createRateLimit({
  windowMs: 1000, // 1 second
  max: 10, // 10 requests per second
  message: 'Request rate too high, please slow down',
});

// IP-based rate limiter for suspicious activity
export const suspiciousActivityRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Very low limit for suspicious IPs
  message: 'Suspicious activity detected, access temporarily restricted',
});

// Export utility function to check if IP should be rate limited more strictly
export const checkSuspiciousActivity = async (ip: string): Promise<boolean> => {
  try {
    // Check for patterns that might indicate suspicious activity
    const failedLogins = await redisClient.get(`failed_logins:${ip}`);
    const alertCount = await redisClient.get(`alert_count:${ip}`);
    
    const failedLoginCount = failedLogins ? parseInt(failedLogins) : 0;
    const alertCountNum = alertCount ? parseInt(alertCount) : 0;
    
    // Mark as suspicious if too many failed logins or alerts
    return failedLoginCount > 10 || alertCountNum > 5;
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return false;
  }
};

// Middleware to apply stricter rate limiting for suspicious IPs
export const adaptiveRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuspicious = await checkSuspiciousActivity(req.ip || 'unknown');
    
    if (isSuspicious) {
      return suspiciousActivityRateLimit(req, res, next);
    } else {
      return generalRateLimit(req, res, next);
    }
  } catch (error) {
    console.error('Adaptive rate limit error:', error);
    return generalRateLimit(req, res, next);
  }
};