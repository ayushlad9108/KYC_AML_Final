import { Request } from 'express';
import { User, UserRole, UserStatus, KYCStatus, DocumentType, VerificationStatus, TransactionType, AMLStatus, AlertSeverity, AlertStatus, ReportType, ReportStatus } from '@prisma/client';

// Re-export Prisma types
export {
  User,
  UserRole,
  UserStatus,
  KYCStatus,
  DocumentType,
  VerificationStatus,
  TransactionType,
  AMLStatus,
  AlertSeverity,
  AlertStatus,
  ReportType,
  ReportStatus,
};

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter params
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// Authentication DTOs
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: Partial<User>;
  token: string;
  refreshToken: string;
}

// KYC DTOs
export interface KYCVerificationDTO {
  documentType: DocumentType;
  documentNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface DocumentUploadDTO {
  documentType: DocumentType;
  file: Express.Multer.File;
}

export interface OCRResult {
  extractedText: string;
  documentNumber?: string;
  name?: string;
  dateOfBirth?: string;
  address?: string;
  expiryDate?: string;
  confidence: number;
}

export interface DocumentAnalysis {
  authenticityScore: number;
  tamperingDetected: boolean;
  qualityScore: number;
  features: string[];
  anomalies: string[];
}

export interface LivenessDetectionDTO {
  sessionId: string;
  videoFrames?: string[];
  challenges: {
    type: 'blink' | 'head_turn' | 'smile';
    completed: boolean;
  }[];
}

export interface LivenessResult {
  passed: boolean;
  livenessScore: number;
  faceMatchScore?: number;
  antiSpoofingScore: number;
  confidence: number;
  reasons: string[];
}

// Transaction DTOs
export interface TransactionDTO {
  transactionType: TransactionType;
  amount: number;
  currency: string;
  counterpartyId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransactionAnalysis {
  riskScore: number;
  riskFactors: string[];
  amlStatus: AMLStatus;
  triggeredRules: string[];
  recommendations: string[];
}

// AML DTOs
export interface AMLAlertDTO {
  userId: string;
  transactionId?: string;
  alertType: string;
  severity: AlertSeverity;
  triggeredRules: string[];
  riskFactors: Record<string, any>;
}

export interface AlertResolutionDTO {
  status: AlertStatus;
  resolutionNotes: string;
  falsePositive: boolean;
}

export interface RiskAssessment {
  userId: string;
  currentScore: number;
  factors: {
    transactionVelocity: number;
    geographicRisk: number;
    behaviorDeviation: number;
    networkRisk: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

// Graph Analysis DTOs
export interface TransactionNode {
  id: string;
  userId: string;
  userName: string;
  riskScore: number;
  totalTransactions: number;
  totalAmount: number;
  nodeType: 'user' | 'entity' | 'account';
}

export interface TransactionEdge {
  id: string;
  source: string;
  target: string;
  transactionCount: number;
  totalAmount: number;
  riskScore: number;
  timeRange: string;
}

export interface TransactionGraph {
  nodes: TransactionNode[];
  edges: TransactionEdge[];
  metadata: {
    timeRange: string;
    totalNodes: number;
    totalEdges: number;
    suspiciousPatterns: string[];
  };
}

// Compliance DTOs
export interface ComplianceRuleDTO {
  ruleName: string;
  ruleType: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  jurisdiction: string;
}

export interface ReportGenerationDTO {
  reportType: ReportType;
  title: string;
  description?: string;
  parameters: {
    startDate?: string;
    endDate?: string;
    jurisdiction?: string;
    includeDetails?: boolean;
    [key: string]: any;
  };
}

// Dashboard DTOs
export interface DashboardMetrics {
  totalUsers: number;
  activeKYCVerifications: number;
  pendingAMLAlerts: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  complianceScore: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'kyc' | 'aml' | 'transaction' | 'alert';
  description: string;
  timestamp: string;
  severity?: AlertSeverity;
  userId?: string;
}

// Error types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTHENTICATION_ERROR', message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}