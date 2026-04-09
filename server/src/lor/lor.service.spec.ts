import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { LorService } from './lor.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { HashService } from '../hash/hash.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { FileService } from '../file/file.service';
import { NotificationService } from '../notification/notification.service';
import { LorStatus, Role } from '@prisma/client';

describe('LorService', () => {
  let lorService: LorService;

  const mockPrismaService = {
    lor: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    consent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPdfService = {
    addQrFooter: jest.fn().mockResolvedValue(Buffer.from('canonical-pdf')),
  };

  const mockHashService = {
    computeHash: jest.fn().mockReturnValue('mock-hash-123'),
  };

  const mockBlockchainService = {
    storeHash: jest.fn().mockResolvedValue({ id: 'blockchain-tx-id' }),
    revokeHash: jest.fn().mockResolvedValue({}),
  };

  const mockFileService = {
    saveOriginalPdf: jest.fn().mockResolvedValue('originals/file.pdf'),
    saveCanonicalPdf: jest.fn().mockResolvedValue('canonical/lor-id.pdf'),
    readPdf: jest.fn().mockResolvedValue(Buffer.from('pdf-content')),
  };

  const mockNotificationService = {
    notifyLorSubmitted: jest.fn().mockResolvedValue(undefined),
    notifyLorApproved: jest.fn().mockResolvedValue(undefined),
    notifyLorRejected: jest.fn().mockResolvedValue(undefined),
    notifyLorRevoked: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PdfService, useValue: mockPdfService },
        { provide: HashService, useValue: mockHashService },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: FileService, useValue: mockFileService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    lorService = module.get<LorService>(LorService);
    jest.clearAllMocks();
  });

  const mockLor = {
    id: 'lor-id',
    title: 'Recommendation Letter',
    subject: 'Mathematics',
    teacherId: 'teacher-id',
    studentId: 'student-id',
    institutionId: 'inst-id',
    originalPdfUrl: 'originals/file.pdf',
    canonicalPdfUrl: null,
    hash: null,
    status: LorStatus.SUBMITTED,
    teacher: { id: 'teacher-id', fullName: 'Teacher Name', email: 'teacher@test.com' },
    student: { id: 'student-id', fullName: 'Student Name', email: 'student@test.com', studentId: 'STU001' },
    institution: { id: 'inst-id', name: 'Test University', code: 'TEST' },
  };

  describe('create', () => {
    const createData = {
      title: 'Recommendation Letter',
      subject: 'Mathematics',
      studentId: 'student-id',
      teacherId: 'teacher-id',
      institutionId: 'inst-id',
      pdfBuffer: Buffer.from('pdf-content'),
      originalFilename: 'lor.pdf',
    };

    it('should create a new LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'student-id',
        institutionId: 'inst-id',
      });
      mockPrismaService.lor.create.mockResolvedValue(mockLor);
      mockPrismaService.consent.create.mockResolvedValue({});

      const result = await lorService.create(createData);

      expect(result).toEqual(mockLor);
      expect(mockFileService.saveOriginalPdf).toHaveBeenCalledWith(
        createData.pdfBuffer,
        createData.originalFilename,
      );
      expect(mockNotificationService.notifyLorSubmitted).toHaveBeenCalled();
    });

    it('should throw ConflictException if LOR already exists for student', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(lorService.create(createData)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if student not in same institution', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'student-id',
        institutionId: 'different-inst-id',
      });

      await expect(lorService.create(createData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return LORs for teacher', async () => {
      mockPrismaService.lor.findMany.mockResolvedValue([mockLor]);

      const result = await lorService.findAll('teacher-id', Role.TEACHER, 'inst-id');

      expect(result).toEqual([mockLor]);
      expect(mockPrismaService.lor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacherId: 'teacher-id' },
        }),
      );
    });

    it('should return LORs for student', async () => {
      mockPrismaService.lor.findMany.mockResolvedValue([mockLor]);

      const result = await lorService.findAll('student-id', Role.STUDENT, 'inst-id');

      expect(mockPrismaService.lor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: 'student-id' },
        }),
      );
    });

    it('should return LORs for admin scoped to institution', async () => {
      mockPrismaService.lor.findMany.mockResolvedValue([mockLor]);

      const result = await lorService.findAll('admin-id', Role.ADMIN, 'inst-id');

      expect(mockPrismaService.lor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { institutionId: 'inst-id' },
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.lor.findMany.mockResolvedValue([]);

      await lorService.findAll('teacher-id', Role.TEACHER, 'inst-id', {
        status: LorStatus.APPROVED,
      });

      expect(mockPrismaService.lor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: LorStatus.APPROVED }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return LOR for owner', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      const result = await lorService.findById('lor-id', 'teacher-id', Role.TEACHER, 'inst-id');

      expect(result).toEqual(mockLor);
    });

    it('should throw NotFoundException for non-existent LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(null);

      await expect(
        lorService.findById('non-existent', 'teacher-id', Role.TEACHER, 'inst-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized teacher', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(
        lorService.findById('lor-id', 'other-teacher-id', Role.TEACHER, 'inst-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for unauthorized student', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(
        lorService.findById('lor-id', 'other-student-id', Role.STUDENT, 'inst-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for admin from different institution', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(
        lorService.findById('lor-id', 'admin-id', Role.ADMIN, 'different-inst-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('approve', () => {
    const approvedLor = {
      ...mockLor,
      status: LorStatus.APPROVED,
      canonicalPdfUrl: 'canonical/lor-id.pdf',
      hash: 'mock-hash-123',
      blockchainTxId: 'blockchain-tx-id',
    };

    it('should approve a submitted LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);
      mockPrismaService.lor.update.mockResolvedValue(approvedLor);

      const result = await lorService.approve('lor-id', 'inst-id');

      expect(result.status).toBe(LorStatus.APPROVED);
      expect(mockPdfService.addQrFooter).toHaveBeenCalled();
      expect(mockHashService.computeHash).toHaveBeenCalled();
      expect(mockBlockchainService.storeHash).toHaveBeenCalled();
      expect(mockNotificationService.notifyLorApproved).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(null);

      await expect(lorService.approve('non-existent', 'inst-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for different institution', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(lorService.approve('lor-id', 'different-inst-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if not in submitted status', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue({
        ...mockLor,
        status: LorStatus.APPROVED,
      });

      await expect(lorService.approve('lor-id', 'inst-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    const rejectedLor = {
      ...mockLor,
      status: LorStatus.REJECTED,
      rejectionReason: 'Invalid content',
    };

    it('should reject a submitted LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);
      mockPrismaService.lor.update.mockResolvedValue(rejectedLor);

      const result = await lorService.reject('lor-id', 'inst-id', 'Invalid content');

      expect(result.status).toBe(LorStatus.REJECTED);
      expect(mockNotificationService.notifyLorRejected).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(null);

      await expect(
        lorService.reject('non-existent', 'inst-id', 'reason'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different institution', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(
        lorService.reject('lor-id', 'different-inst-id', 'reason'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('revoke', () => {
    const approvedLor = {
      ...mockLor,
      status: LorStatus.APPROVED,
      hash: 'mock-hash-123',
    };

    it('should revoke an approved LOR by admin', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(approvedLor);
      mockPrismaService.lor.update.mockResolvedValue({
        ...approvedLor,
        status: LorStatus.REVOKED,
      });

      const result = await lorService.revoke(
        'lor-id',
        'admin-id',
        Role.ADMIN,
        'inst-id',
        'Fraudulent',
      );

      expect(result.status).toBe(LorStatus.REVOKED);
      expect(mockBlockchainService.revokeHash).toHaveBeenCalled();
      expect(mockNotificationService.notifyLorRevoked).toHaveBeenCalled();
    });

    it('should revoke an approved LOR by teacher who created it', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(approvedLor);
      mockPrismaService.lor.update.mockResolvedValue({
        ...approvedLor,
        status: LorStatus.REVOKED,
      });

      const result = await lorService.revoke(
        'lor-id',
        'teacher-id',
        Role.TEACHER,
        'inst-id',
        'Error in letter',
      );

      expect(result.status).toBe(LorStatus.REVOKED);
    });

    it('should throw ForbiddenException for teacher who did not create LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(approvedLor);

      await expect(
        lorService.revoke('lor-id', 'other-teacher', Role.TEACHER, 'inst-id', 'reason'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if LOR is not approved', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor); // Status is SUBMITTED

      await expect(
        lorService.revoke('lor-id', 'admin-id', Role.ADMIN, 'inst-id', 'reason'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acknowledge', () => {
    const mockConsent = {
      id: 'consent-id',
      lorId: 'lor-id',
      studentId: 'student-id',
      acknowledged: false,
    };

    it('should acknowledge consent for student', async () => {
      mockPrismaService.consent.findUnique.mockResolvedValue(mockConsent);
      mockPrismaService.consent.update.mockResolvedValue({
        ...mockConsent,
        acknowledged: true,
        acknowledgedAt: new Date(),
      });

      const result = await lorService.acknowledge('lor-id', 'student-id');

      expect(result.acknowledged).toBe(true);
    });

    it('should throw NotFoundException for missing consent', async () => {
      mockPrismaService.consent.findUnique.mockResolvedValue(null);

      await expect(
        lorService.acknowledge('lor-id', 'student-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for wrong student', async () => {
      mockPrismaService.consent.findUnique.mockResolvedValue(mockConsent);

      await expect(
        lorService.acknowledge('lor-id', 'wrong-student-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateShareLink', () => {
    const approvedLor = {
      ...mockLor,
      status: LorStatus.APPROVED,
      consent: { acknowledged: true },
    };

    it('should generate share link for approved LOR', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(approvedLor);

      const result = await lorService.generateShareLink('lor-id', 'student-id');

      expect(result).toHaveProperty('shareUrl');
      expect(result).toHaveProperty('qrUrl');
    });

    it('should throw ForbiddenException for non-owner student', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(approvedLor);

      await expect(
        lorService.generateShareLink('lor-id', 'other-student-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if LOR is not approved', async () => {
      mockPrismaService.lor.findUnique.mockResolvedValue(mockLor);

      await expect(
        lorService.generateShareLink('lor-id', 'student-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
