import { Router, Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { 
  loginValidation, 
  registerValidation,
  handleValidationErrors,
  nameValidation,
  passwordValidation
} from '@/middleware/validation';
import { 
  authRateLimit, 
  passwordResetRateLimit 
} from '@/middleware/rateLimit';
import { 
  authenticate, 
  optionalAuth 
} from '@/middleware/auth';
import { 
  AuthenticatedRequest,
  LoginDTO,
  RegisterDTO,
  ApiResponse
} from '@/types';
import { body } from 'express-validator';

const router = Router();
const authService = new AuthService();

// POST /api/auth/register - User registration
router.post('/register', 
  authRateLimit,
  registerValidation,
  async (req: Request, res: Response) => {
    try {
      const registerData: RegisterDTO = req.body;
      const result = await authService.register(registerData);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_ERROR',
          message: error.message || 'Registration failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// POST /api/auth/login - User login
router.post('/login',
  authRateLimit,
  loginValidation,
  async (req: Request, res: Response) => {
    try {
      const loginData: LoginDTO = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await authService.login(loginData, ipAddress, userAgent);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'LOGIN_ERROR',
          message: error.message || 'Login failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
  authRateLimit,
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'TOKEN_REFRESH_ERROR',
          message: error.message || 'Token refresh failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// POST /api/auth/logout - User logout
router.post('/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const token = req.headers.authorization!.substring(7); // Remove 'Bearer '

      await authService.logout(userId, token);

      const response: ApiResponse = {
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'LOGOUT_ERROR',
          message: error.message || 'Logout failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// GET /api/auth/profile - Get user profile
router.get('/profile',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getUserProfile(userId);

      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'PROFILE_ERROR',
          message: error.message || 'Failed to get profile',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// PUT /api/auth/profile - Update user profile
router.put('/profile',
  authenticate,
  [
    nameValidation('firstName'),
    nameValidation('lastName'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),
    body('nationality')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Nationality must be between 1 and 50 characters'),
    body('occupation')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Occupation must be between 1 and 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors,
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const updateData = req.body;

      const updatedProfile = await authService.updateUserProfile(userId, updateData);

      const response: ApiResponse<typeof updatedProfile> = {
        success: true,
        data: updatedProfile,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'PROFILE_UPDATE_ERROR',
          message: error.message || 'Failed to update profile',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// POST /api/auth/change-password - Change password
router.post('/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    passwordValidation.withMessage('New password does not meet requirements'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors,
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, password: newPassword } = req.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'PASSWORD_CHANGE_ERROR',
          message: error.message || 'Failed to change password',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// GET /api/auth/sessions - Get user sessions
router.get('/sessions',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const sessions = await authService.getUserSessions(userId);

      const response: ApiResponse<typeof sessions> = {
        success: true,
        data: sessions,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'SESSIONS_ERROR',
          message: error.message || 'Failed to get sessions',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// POST /api/auth/revoke-sessions - Revoke all sessions
router.post('/revoke-sessions',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      await authService.revokeAllSessions(userId);

      const response: ApiResponse = {
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'REVOKE_SESSIONS_ERROR',
          message: error.message || 'Failed to revoke sessions',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    }
  }
);

// GET /api/auth/verify - Verify token (for frontend to check if user is still authenticated)
router.get('/verify',
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Not authenticated',
          },
        });
      }

      const profile = await authService.getUserProfile(req.user.userId);

      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.code || 'VERIFY_ERROR',
          message: error.message || 'Token verification failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json(response);
    }
  }
);

export default router;