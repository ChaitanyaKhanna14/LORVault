import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LorStatus, Role } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import { HashService } from '../hash/hash.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { FileService } from '../file/file.service';
import { NotificationService } from '../notification/notification.service';

interface CreateLorData {
  title: string;
  subject: string;
  studentId: string;
  teacherId: string;
  institutionId: string;
  pdfBuffer: Buffer;
  originalFilename: string;
}

@Injectable()
export class LorService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private hashService: HashService,
    private blockchainService: BlockchainService,
    private fileService: FileService,
    private notificationService: NotificationService,
  ) {}

  async create(data: CreateLorData) {
    // Check if LOR already exists for this teacher-student pair
    const existingLor = await this.prisma.lor.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: data.teacherId,
          studentId: data.studentId,
        },
      },
    });

    if (existingLor) {
      throw new ConflictException('An LOR already exists for this student');
    }

    // Validate student belongs to same institution
    const student = await this.prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student || student.institutionId !== data.institutionId) {
      throw new BadRequestException('Student not found in your institution');
    }

    // Store original PDF
    const originalPdfUrl = await this.fileService.saveOriginalPdf(data.pdfBuffer, data.originalFilename);

    // Create LOR record
    const lor = await this.prisma.lor.create({
      data: {
        title: data.title,
        subject: data.subject,
        teacherId: data.teacherId,
        studentId: data.studentId,
        institutionId: data.institutionId,
        originalPdfUrl,
        status: LorStatus.SUBMITTED,
      },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    // Create consent record
    await this.prisma.consent.create({
      data: {
        lorId: lor.id,
        studentId: data.studentId,
      },
    });

    // Notify student and admins
    await this.notificationService.notifyLorSubmitted(lor);

    return lor;
  }

  async findAll(userId: string, role: Role, institutionId: string | null, filters?: { status?: LorStatus }) {
    const where: any = {};

    // Scope based on role
    if (role === Role.TEACHER) {
      where.teacherId = userId;
    } else if (role === Role.STUDENT) {
      where.studentId = userId;
    } else if (role === Role.ADMIN && institutionId) {
      where.institutionId = institutionId;
    } else if (role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.lor.findMany({
      where,
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, role: Role, institutionId: string | null) {
    const lor = await this.prisma.lor.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
        consent: true,
      },
    });

    if (!lor) {
      throw new NotFoundException('LOR not found');
    }

    // Check access
    if (role === Role.TEACHER && lor.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (role === Role.STUDENT && lor.studentId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (role === Role.ADMIN && lor.institutionId !== institutionId) {
      throw new ForbiddenException('Access denied');
    }

    return lor;
  }

  async approve(lorId: string, adminInstitutionId: string) {
    const lor = await this.prisma.lor.findUnique({
      where: { id: lorId },
      include: {
        teacher: true,
        student: true,
        institution: true,
      },
    });

    if (!lor) {
      throw new NotFoundException('LOR not found');
    }

    if (lor.institutionId !== adminInstitutionId) {
      throw new ForbiddenException('Access denied');
    }

    if (lor.status !== LorStatus.SUBMITTED) {
      throw new BadRequestException('LOR is not in submitted status');
    }

    // Read original PDF
    const originalPdfBuffer = await this.fileService.readPdf(lor.originalPdfUrl);

    // Add QR code and footer to PDF
    const canonicalPdfBuffer = await this.pdfService.addQrFooter(originalPdfBuffer, lorId, lor.institution.name);

    // Compute hash
    const hash = this.hashService.computeHash(canonicalPdfBuffer);

    // Store on blockchain
    const blockchainRecord = await this.blockchainService.storeHash({
      hash,
      lorId: lor.id,
      studentId: lor.studentId,
      teacherId: lor.teacherId,
      institutionId: lor.institutionId,
    });

    // Save canonical PDF
    const canonicalPdfUrl = await this.fileService.saveCanonicalPdf(canonicalPdfBuffer, lorId);

    // Update LOR
    const updatedLor = await this.prisma.lor.update({
      where: { id: lorId },
      data: {
        status: LorStatus.APPROVED,
        canonicalPdfUrl,
        hash,
        blockchainTxId: blockchainRecord.id,
        approvedAt: new Date(),
      },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    // Notify teacher and student
    await this.notificationService.notifyLorApproved(updatedLor);

    return updatedLor;
  }

  async reject(lorId: string, adminInstitutionId: string, reason: string) {
    const lor = await this.prisma.lor.findUnique({
      where: { id: lorId },
    });

    if (!lor) {
      throw new NotFoundException('LOR not found');
    }

    if (lor.institutionId !== adminInstitutionId) {
      throw new ForbiddenException('Access denied');
    }

    if (lor.status !== LorStatus.SUBMITTED) {
      throw new BadRequestException('LOR is not in submitted status');
    }

    const updatedLor = await this.prisma.lor.update({
      where: { id: lorId },
      data: {
        status: LorStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    // Notify teacher
    await this.notificationService.notifyLorRejected(updatedLor);

    return updatedLor;
  }

  async revoke(lorId: string, userId: string, role: Role, institutionId: string | null, reason: string) {
    const lor = await this.prisma.lor.findUnique({
      where: { id: lorId },
    });

    if (!lor) {
      throw new NotFoundException('LOR not found');
    }

    // Check access - only admin of same institution or teacher who wrote it can revoke
    if (role === Role.ADMIN && lor.institutionId !== institutionId) {
      throw new ForbiddenException('Access denied');
    }
    if (role === Role.TEACHER && lor.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (lor.status !== LorStatus.APPROVED) {
      throw new BadRequestException('Only approved LORs can be revoked');
    }

    // Revoke on blockchain
    if (lor.hash) {
      await this.blockchainService.revokeHash(lor.hash, reason);
    }

    const updatedLor = await this.prisma.lor.update({
      where: { id: lorId },
      data: {
        status: LorStatus.REVOKED,
        revokeReason: reason,
        revokedAt: new Date(),
      },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
        institution: { select: { id: true, name: true, code: true } },
      },
    });

    // Notify
    await this.notificationService.notifyLorRevoked(updatedLor);

    return updatedLor;
  }

  async acknowledge(lorId: string, studentId: string) {
    const consent = await this.prisma.consent.findUnique({
      where: { lorId },
    });

    if (!consent) {
      throw new NotFoundException('Consent record not found');
    }

    if (consent.studentId !== studentId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.consent.update({
      where: { id: consent.id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });
  }

  async getPdfBuffer(lorId: string, userId: string, role: Role, institutionId: string | null, type: 'original' | 'canonical') {
    const lor = await this.findById(lorId, userId, role, institutionId);

    const pdfUrl = type === 'canonical' && lor.canonicalPdfUrl ? lor.canonicalPdfUrl : lor.originalPdfUrl;

    return this.fileService.readPdf(pdfUrl);
  }

  async generateShareLink(lorId: string, studentId: string) {
    const lor = await this.prisma.lor.findUnique({
      where: { id: lorId },
      include: { consent: true },
    });

    if (!lor) {
      throw new NotFoundException('LOR not found');
    }

    if (lor.studentId !== studentId) {
      throw new ForbiddenException('Access denied');
    }

    if (lor.status !== LorStatus.APPROVED) {
      throw new BadRequestException('LOR must be approved to share');
    }

    // Return verification URL
    return {
      shareUrl: `${process.env.APP_URL}/api/verify/${lorId}`,
      qrUrl: `${process.env.APP_URL}/api/verify/${lorId}`,
    };
  }
}
