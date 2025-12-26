import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '@/types';

// Middleware to handle validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formattedErrors,
      },
    });
  }
  
  next();
};

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const phoneValidation = body('phone')
  .optional()
  .isMobilePhone('any')
  .withMessage('Please provide a valid phone number');

export const nameValidation = (field: string) => 
  body(field)
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(`${field} must be between 1 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${field} must contain only letters and spaces`);

export const uuidValidation = (field: string) =>
  param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`);

// Authentication validation rules
export const loginValidation = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const registerValidation = [
  emailValidation,
  passwordValidation,
  phoneValidation,
  nameValidation('firstName'),
  nameValidation('lastName'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'ANALYST', 'COMPLIANCE_OFFICER', 'ADMIN'])
    .withMessage('Invalid role specified'),
  handleValidationErrors,
];

// KYC validation rules
export const kycVerificationValidation = [
  body('documentType')
    .isIn(['PAN', 'AADHAAR', 'DRIVERS_LICENSE', 'PASSPORT', 'VOTER_ID'])
    .withMessage('Invalid document type'),
  body('documentNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Document number must be between 5 and 20 characters'),
  nameValidation('firstName'),
  nameValidation('lastName'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 18 || age > 120) {
        throw new Error('Age must be between 18 and 120 years');
      }
      return true;
    }),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Street address must be between 1 and 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1 and 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State must be between 1 and 50 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be between 1 and 50 characters'),
  body('address.postalCode')
    .optional()
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Postal code must be 6 digits'),
  handleValidationErrors,
];

// Transaction validation rules
export const transactionValidation = [
  body('transactionType')
    .isIn(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND'])
    .withMessage('Invalid transaction type'),
  body('amount')
    .isFloat({ min: 0.01, max: 10000000 })
    .withMessage('Amount must be between 0.01 and 10,000,000'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  body('counterpartyId')
    .optional()
    .isUUID()
    .withMessage('Counterparty ID must be a valid UUID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  handleValidationErrors,
];

// AML Alert validation rules
export const amlAlertValidation = [
  body('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('transactionId')
    .optional()
    .isUUID()
    .withMessage('Transaction ID must be a valid UUID'),
  body('alertType')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Alert type must be between 1 and 100 characters'),
  body('severity')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid severity level'),
  body('triggeredRules')
    .isArray()
    .withMessage('Triggered rules must be an array'),
  body('riskFactors')
    .isObject()
    .withMessage('Risk factors must be an object'),
  handleValidationErrors,
];

export const alertResolutionValidation = [
  body('status')
    .isIn(['RESOLVED', 'FALSE_POSITIVE', 'ESCALATED'])
    .withMessage('Invalid alert status'),
  body('resolutionNotes')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Resolution notes must be between 10 and 500 characters'),
  body('falsePositive')
    .isBoolean()
    .withMessage('False positive must be a boolean'),
  handleValidationErrors,
];

// Compliance Rule validation
export const complianceRuleValidation = [
  body('ruleName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Rule name must be between 1 and 100 characters'),
  body('ruleType')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rule type must be between 1 and 50 characters'),
  body('conditions')
    .isObject()
    .withMessage('Conditions must be an object'),
  body('actions')
    .isObject()
    .withMessage('Actions must be an object'),
  body('priority')
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  body('jurisdiction')
    .optional()
    .isIn(['IN', 'US', 'EU', 'UK'])
    .withMessage('Invalid jurisdiction'),
  handleValidationErrors,
];

// Report generation validation
export const reportGenerationValidation = [
  body('reportType')
    .isIn(['KYC_SUMMARY', 'AML_ALERTS', 'TRANSACTION_ANALYSIS', 'COMPLIANCE_AUDIT', 'REGULATORY_FILING'])
    .withMessage('Invalid report type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parameters')
    .isObject()
    .withMessage('Parameters must be an object'),
  body('parameters.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('parameters.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (req.body.parameters?.startDate && endDate) {
        const start = new Date(req.body.parameters.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

// Query parameter validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors,
];

export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors,
];

// File upload validation
export const fileUploadValidation = (allowedTypes: string[], maxSizeBytes: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_REQUIRED',
          message: 'File is required',
        },
      });
    }

    // Check file type
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        },
      });
    }

    // Check file size
    if (req.file.size > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
        },
      });
    }

    next();
  };
};

// Custom validation for Indian documents
export const panValidation = body('documentNumber')
  .optional()
  .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  .withMessage('PAN number must be in format: ABCDE1234F');

export const aadhaarValidation = body('documentNumber')
  .optional()
  .matches(/^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/)
  .withMessage('Aadhaar number must be in format: 1234 5678 9012');

// IP address validation
export const ipValidation = (field: string) =>
  body(field)
    .optional()
    .isIP()
    .withMessage(`${field} must be a valid IP address`);

// Custom sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};