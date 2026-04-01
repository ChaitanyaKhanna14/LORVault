// Shared types for LORVault

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
  CONSENT_REQUESTED = 'CONSENT_REQUESTED',
  CONSENT_GIVEN = 'CONSENT_GIVEN',
  TEACHER_INVITED = 'TEACHER_INVITED',
  VERIFICATION_ALERT = 'VERIFICATION_ALERT',
}

export interface Institution {
  id: string;
  name: string;
  domain?: string;
  code: string;
  logoUrl?: string;
  createdAt: string;
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
  invitedAt?: string;
  registeredAt?: string;
  createdAt: string;
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
  submittedAt: string;
  approvedAt?: string;
  revokedAt?: string;
}

export interface Consent {
  id: string;
  lorId: string;
  studentId: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface VerificationLog {
  id: string;
  lorId?: string;
  verifierEmail?: string;
  verifierInstitution?: string;
  uploadedHash: string;
  result: VerifyResult;
  verifiedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  lorId?: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface VerificationRequest {
  hash?: string;
  verifierEmail?: string;
  verifierInstitution?: string;
}

export interface VerificationResponse {
  result: VerifyResult;
  lor?: Lor;
  message: string;
}

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

export interface CreateInstitutionRequest {
  name: string;
  domain?: string;
  code: string;
  logoUrl?: string;
}

export interface InviteTeacherRequest {
  email: string;
  fullName: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
