// Core User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  riskScore: number;
  kycStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: Address;
  nationality?: string;
  occupation?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

// KYC Types
export interface KYCVerification {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  verificationMethod: string;
  verifiedAt?: string;
  expiresAt?: string;
  verificationData: Record<string, any>;
  createdAt: string;
}

export interface DocumentUpload {
  id: string;
  userId: string;
  kycVerificationId: string;
  documentType: DocumentType;
  filePath: string;
  fileHash: string;
  ocrData: OCRData;
  aiAnalysis: AIAnalysis;
  createdAt: string;
}

export interface OCRData {
  extractedText: string;
  documentNumber?: string;
  name?: string;
  dateOfBirth?: string;
  address?: string;
  expiryDate?: string;
  confidence: number;
}

export interface AIAnalysis {
  authenticityScore: number;
  tamperingDetected: boolean;
  qualityScore: number;
  features: string[];
  anomalies: string[];
}

export interface LivenessDetection {
  id: string;
  userId: string;
  sessionId: string;
  livenessScore: number;
  faceMatchScore: number;
  antiSpoofingScore: number;
  challenges: LivenessChallenge[];
  result: LivenessResult;
  createdAt: string;
}

export interface LivenessChallenge {
  type: 'blink' | 'head_turn' | 'smile';
  completed: boolean;
  score: number;
}

export interface LivenessResult {
  passed: boolean;
  confidence: number;
  reasons: string[];
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  counterpartyId?: string;
  counterparty?: User;
  transactionTime: string;
  riskScore: number;
  amlStatus: AMLStatus;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface TransactionPattern {
  userId: string;
  patternType: string;
  frequency: number;
  averageAmount: number;
  timePattern: string;
  riskLevel: RiskLevel;
}

// AML Types
export interface AMLAlert {
  id: string;
  userId: string;
  transactionId?: string;
  alertType: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredRules: string[];
  riskFactors: Record<string, any>;
  assignedTo?: string;
  assignedUser?: User;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface ComplianceRule {
  id: string;
  ruleName: string;
  ruleType: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  isActive: boolean;
  jurisdiction: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  actorType?: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalUsers: number;
  activeKYCVerifications: number;
  pendingAMLAlerts: number;
  riskDistribution: RiskDistribution;
  complianceScore: number;
  recentActivity: ActivityItem[];
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ActivityItem {
  id: string;
  type: 'kyc' | 'aml' | 'transaction' | 'alert';
  description: string;
  timestamp: string;
  severity?: AlertSeverity;
  userId?: string;
}

// Graph Types for Transaction Flow
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

// Report Types
export interface ComplianceReport {
  id: string;
  reportType: ReportType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  generatedBy: string;
  generatedAt: string;
  status: ReportStatus;
  filePath?: string;
  jurisdiction: string;
}

// Enums
export enum UserRole {
  CUSTOMER = 'customer',
  ANALYST = 'analyst',
  COMPLIANCE_OFFICER = 'compliance_officer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum DocumentType {
  PAN = 'pan',
  AADHAAR = 'aadhaar',
  DRIVERS_LICENSE = 'drivers_license',
  PASSPORT = 'passport',
  VOTER_ID = 'voter_id'
}

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund'
}

export enum AMLStatus {
  CLEAR = 'clear',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review',
  BLOCKED = 'blocked'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  ESCALATED = 'escalated'
}

export enum ReportType {
  KYC_SUMMARY = 'kyc_summary',
  AML_ALERTS = 'aml_alerts',
  TRANSACTION_ANALYSIS = 'transaction_analysis',
  COMPLIANCE_AUDIT = 'compliance_audit',
  REGULATORY_FILING = 'regulatory_filing'
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// API Response Types
export interface ApiResponse<T> {
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

// UI State Types
export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;
  modals: Record<string, boolean>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}