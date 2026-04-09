// ============================================
// LORVault Shared Types
// ============================================
//
// These types are shared between:
// - Mobile app (imports directly from @lorvault/shared)
// - Server (uses @prisma/client types which are structurally identical)
//
// The enums and interfaces here MUST stay in sync with:
// - server/prisma/schema.prisma (database enums)
// - apps/mobile usage
//
// NOTE: Server imports from @prisma/client for auto-generated types that
// match the database schema. Mobile imports from here. Both are compatible
// because they use the same string values.
// ============================================

// ---------- Enums ----------

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  EXTERNAL = 'EXTERNAL',
}

export enum UserStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
}

export enum LorStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVOKED = 'REVOKED',
}

export enum VerifyResult {
  VERIFIED = 'VERIFIED',
  NOT_FOUND = 'NOT_FOUND',
  REVOKED = 'REVOKED',
}

export enum NotificationType {
  LOR_SUBMITTED = 'LOR_SUBMITTED',
  LOR_APPROVED = 'LOR_APPROVED',
  LOR_REJECTED = 'LOR_REJECTED',
  LOR_REVOKED = 'LOR_REVOKED',
  LOR_VERIFIED = 'LOR_VERIFIED',
  CONSENT_REQUIRED = 'CONSENT_REQUIRED',
}

// ---------- Interfaces ----------

export interface Institution {
  id: string;
  name: string;
  domain?: string;
  code: string;
  logoUrl?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studentId?: string;
  institutionId?: string;
  institution?: Institution;
  status: UserStatus;
  invitedAt?: Date;
  registeredAt?: Date;
  createdAt: Date;
}

export interface Lor {
  id: string;
  title: string;
  subject: string;
  status: LorStatus;
  originalPdfUrl: string;
  canonicalPdfUrl?: string;
  hash?: string;
  blockchainTxId?: string;
  teacherId: string;
  teacher?: User;
  studentId: string;
  student?: User;
  institutionId: string;
  institution?: Institution;
  rejectionReason?: string;
  revokeReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  revokedAt?: Date;
}

export interface Consent {
  id: string;
  lorId: string;
  studentId: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export interface VerificationLog {
  id: string;
  lorId?: string;
  verifierEmail?: string;
  verifierInstitution?: string;
  uploadedHash: string;
  result: VerifyResult;
  verifiedAt: Date;
}

export interface BlockchainRecord {
  id: string;
  hash: string;
  studentId: string;
  teacherId: string;
  institutionId: string;
  lorId: string;
  revoked: boolean;
  revokeReason?: string;
  createdAt: Date;
  revokedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  lorId?: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

// ---------- API Types ----------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------- Auth Types ----------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  institutionCode: string;
}

export interface RegisterExternalRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ---------- LOR Types ----------

export interface CreateLorRequest {
  title: string;
  subject: string;
  studentId: string;
}

export interface ApproveLorRequest {
  lorId: string;
}

export interface RejectLorRequest {
  lorId: string;
  reason: string;
}

export interface RevokeLorRequest {
  lorId: string;
  reason: string;
}

export interface LorListFilters {
  status?: LorStatus;
  teacherId?: string;
  studentId?: string;
  page?: number;
  pageSize?: number;
}

// ---------- Verification Types ----------

export interface VerifyByUploadRequest {
  verifierEmail?: string;
  verifierInstitution?: string;
}

export interface VerificationResponse {
  result: VerifyResult;
  lor?: {
    id: string;
    title: string;
    subject: string;
    teacherName: string;
    studentName: string;
    institutionName: string;
    approvedAt?: Date;
    revokedAt?: Date;
    revokeReason?: string;
  };
  verifiedAt: Date;
}

// ---------- Institution Types ----------

export interface CreateInstitutionRequest {
  name: string;
  domain?: string;
  code: string;
  logoUrl?: string;
}

export interface CreateFirstAdminRequest {
  institutionId: string;
  email: string;
  fullName: string;
  password: string;
}

// ---------- User Management Types ----------

export interface InviteTeacherRequest {
  email: string;
  fullName: string;
}

export interface AddStudentRequest {
  email: string;
  fullName: string;
  studentId: string;
}

export interface StudentRosterItem {
  email: string;
  fullName: string;
  studentId: string;
}

// ---------- Notification Types ----------

export interface NotificationListFilters {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}

// ---------- Type Guards ----------

export function isLorStatus(value: string): value is LorStatus {
  return Object.values(LorStatus).includes(value as LorStatus);
}

export function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

export function isVerifyResult(value: string): value is VerifyResult {
  return Object.values(VerifyResult).includes(value as VerifyResult);
}

// ---------- Constants ----------

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.ADMIN]: 80,
  [Role.TEACHER]: 60,
  [Role.STUDENT]: 40,
  [Role.EXTERNAL]: 20,
};

export const LOR_STATUS_LABELS: Record<LorStatus, string> = {
  [LorStatus.SUBMITTED]: 'Submitted',
  [LorStatus.APPROVED]: 'Approved',
  [LorStatus.REJECTED]: 'Rejected',
  [LorStatus.REVOKED]: 'Revoked',
};

export const LOR_STATUS_COLORS: Record<LorStatus, string> = {
  [LorStatus.SUBMITTED]: '#F59E0B',
  [LorStatus.APPROVED]: '#10B981',
  [LorStatus.REJECTED]: '#EF4444',
  [LorStatus.REVOKED]: '#64748B',
};

export const VERIFY_RESULT_LABELS: Record<VerifyResult, string> = {
  [VerifyResult.VERIFIED]: 'Verified',
  [VerifyResult.NOT_FOUND]: 'Not Found',
  [VerifyResult.REVOKED]: 'Revoked',
};
