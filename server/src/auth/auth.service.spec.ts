import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    institution: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('7d'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: '', // Will be set in test
      role: Role.STUDENT,
      status: UserStatus.REGISTERED,
      institutionId: 'inst-id',
      fullName: 'Test User',
      institution: { id: 'inst-id', name: 'Test Institution' },
    };

    beforeEach(async () => {
      mockUser.passwordHash = await bcrypt.hash('password123', 10);
    });

    it('should return user and tokens on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update status from INVITED to REGISTERED on first login', async () => {
      const invitedUser = { ...mockUser, status: UserStatus.INVITED };
      mockPrismaService.user.findUnique.mockResolvedValue(invitedUser);
      mockPrismaService.user.update.mockResolvedValue(invitedUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      await authService.login({ email: 'test@example.com', password: 'password123' });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: expect.objectContaining({
          status: UserStatus.REGISTERED,
          registeredAt: expect.any(Date),
        }),
      });
    });
  });

  describe('registerStudent', () => {
    const mockInstitution = {
      id: 'inst-id',
      name: 'Test University',
      code: 'TEST-2024',
    };

    it('should register a new student', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'student@example.com',
        fullName: 'New Student',
        role: Role.STUDENT,
        status: UserStatus.REGISTERED,
        institutionId: 'inst-id',
        institution: mockInstitution,
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await authService.registerStudent({
        email: 'student@example.com',
        password: 'password123',
        fullName: 'New Student',
        studentId: 'STU001',
        institutionCode: 'TEST-2024',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('student@example.com');
    });

    it('should throw NotFoundException for invalid institution code', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(null);

      await expect(
        authService.registerStudent({
          email: 'student@example.com',
          password: 'password123',
          fullName: 'New Student',
          studentId: 'STU001',
          institutionCode: 'INVALID',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for existing email', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.registerStudent({
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'New Student',
          studentId: 'STU001',
          institutionCode: 'TEST-2024',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for existing student ID', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.registerStudent({
          email: 'student@example.com',
          password: 'password123',
          fullName: 'New Student',
          studentId: 'EXISTING-ID',
          institutionCode: 'TEST-2024',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('registerExternal', () => {
    it('should register a new external verifier', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-external-id',
        email: 'verifier@example.com',
        fullName: 'External Verifier',
        role: Role.EXTERNAL,
        status: UserStatus.REGISTERED,
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await authService.registerExternal({
        email: 'verifier@example.com',
        password: 'password123',
        fullName: 'External Verifier',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.role).toBe(Role.EXTERNAL);
    });

    it('should throw ConflictException for existing email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.registerExternal({
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'External Verifier',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = {
      id: 'token-id',
      token: 'valid-refresh-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: Role.STUDENT,
        institutionId: 'inst-id',
        institution: { id: 'inst-id', name: 'Test Institution' },
      },
    };

    it('should return new tokens for valid refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue({});
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await authService.refresh({ refreshToken: 'valid-refresh-token' });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refresh({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue({});

      await expect(
        authService.refresh({ refreshToken: 'expired-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await authService.logout('some-refresh-token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
      });
    });
  });
});
