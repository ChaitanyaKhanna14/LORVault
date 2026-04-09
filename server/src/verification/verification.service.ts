import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../hash/hash.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { VerifyResult, LorStatus } from '@prisma/client';

interface VerifyByUploadData {
  pdfBuffer: Buffer;
  verifierEmail?: string;
  verifierInstitution?: string;
}

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private blockchainService: BlockchainService,
  ) {}

  async verifyByUpload(data: VerifyByUploadData) {
    // Compute hash of uploaded PDF
    const uploadedHash = this.hashService.computeHash(data.pdfBuffer);

    // Check blockchain
    const blockchainResult = await this.blockchainService.verifyHash(uploadedHash);

    let lor = null;
    if (blockchainResult.record) {
      lor = await this.prisma.lor.findUnique({
        where: { id: blockchainResult.record.lorId },
        include: {
          teacher: { select: { fullName: true } },
          student: { select: { fullName: true } },
          institution: { select: { name: true } },
        },
      });
    }

    // Log verification attempt
    await this.prisma.verificationLog.create({
      data: {
        lorId: blockchainResult.record?.lorId,
        verifierEmail: data.verifierEmail,
        verifierInstitution: data.verifierInstitution,
        uploadedHash,
        result: blockchainResult.result,
      },
    });

    return {
      result: blockchainResult.result,
      lor: lor ? {
        id: lor.id,
        title: lor.title,
        subject: lor.subject,
        teacherName: lor.teacher.fullName,
        studentName: lor.student.fullName,
        institutionName: lor.institution.name,
        approvedAt: lor.approvedAt,
        revokedAt: lor.revokedAt,
        revokeReason: lor.revokeReason,
      } : undefined,
      verifiedAt: new Date(),
    };
  }

  async verifyByLorId(lorId: string) {
    const lor = await this.prisma.lor.findUnique({
      where: { id: lorId },
      include: {
        teacher: { select: { fullName: true } },
        student: { select: { fullName: true } },
        institution: { select: { name: true } },
      },
    });

    if (!lor) {
      return {
        result: VerifyResult.NOT_FOUND,
        verifiedAt: new Date(),
      };
    }

    if (lor.status === LorStatus.REVOKED) {
      return {
        result: VerifyResult.REVOKED,
        lor: {
          id: lor.id,
          title: lor.title,
          subject: lor.subject,
          teacherName: lor.teacher.fullName,
          studentName: lor.student.fullName,
          institutionName: lor.institution.name,
          approvedAt: lor.approvedAt,
          revokedAt: lor.revokedAt,
          revokeReason: lor.revokeReason,
        },
        verifiedAt: new Date(),
      };
    }

    if (lor.status !== LorStatus.APPROVED) {
      return {
        result: VerifyResult.NOT_FOUND,
        verifiedAt: new Date(),
      };
    }

    return {
      result: VerifyResult.VERIFIED,
      lor: {
        id: lor.id,
        title: lor.title,
        subject: lor.subject,
        teacherName: lor.teacher.fullName,
        studentName: lor.student.fullName,
        institutionName: lor.institution.name,
        approvedAt: lor.approvedAt,
      },
      verifiedAt: new Date(),
    };
  }

  async getVerificationHistory(userId: string) {
    return this.prisma.verificationLog.findMany({
      where: {
        lor: {
          OR: [
            { teacherId: userId },
            { studentId: userId },
          ],
        },
      },
      include: {
        lor: {
          select: {
            title: true,
            student: { select: { fullName: true } },
          },
        },
      },
      orderBy: { verifiedAt: 'desc' },
      take: 50,
    });
  }

  async getHistoryByEmail(email: string) {
    return this.prisma.verificationLog.findMany({
      where: {
        verifierEmail: email,
      },
      include: {
        lor: {
          select: {
            id: true,
            title: true,
            subject: true,
            teacher: { select: { fullName: true } },
            student: { select: { fullName: true } },
            institution: { select: { name: true } },
          },
        },
      },
      orderBy: { verifiedAt: 'desc' },
      take: 50,
    });
  }
}
