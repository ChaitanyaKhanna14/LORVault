import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyResult } from '@prisma/client';

interface StoreHashData {
  hash: string;
  lorId: string;
  studentId: string;
  teacherId: string;
  institutionId: string;
}

export interface VerificationResult {
  result: VerifyResult;
  record?: {
    id: string;
    hash: string;
    lorId: string;
    studentId: string;
    teacherId: string;
    institutionId: string;
    revoked: boolean;
    revokeReason: string | null;
    createdAt: Date;
    revokedAt: Date | null;
  };
}

@Injectable()
export class BlockchainService {
  constructor(private prisma: PrismaService) {}

  async storeHash(data: StoreHashData) {
    return this.prisma.blockchainRecord.create({
      data: {
        hash: data.hash,
        lorId: data.lorId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        institutionId: data.institutionId,
      },
    });
  }

  async verifyHash(hash: string): Promise<VerificationResult> {
    const record = await this.prisma.blockchainRecord.findUnique({
      where: { hash },
    });

    if (!record) {
      return { result: VerifyResult.NOT_FOUND };
    }

    if (record.revoked) {
      return {
        result: VerifyResult.REVOKED,
        record,
      };
    }

    return {
      result: VerifyResult.VERIFIED,
      record,
    };
  }

  async revokeHash(hash: string, reason: string) {
    const record = await this.prisma.blockchainRecord.findUnique({
      where: { hash },
    });

    if (!record) {
      throw new NotFoundException('Blockchain record not found');
    }

    return this.prisma.blockchainRecord.update({
      where: { hash },
      data: {
        revoked: true,
        revokeReason: reason,
        revokedAt: new Date(),
      },
    });
  }

  async findByLorId(lorId: string) {
    return this.prisma.blockchainRecord.findUnique({
      where: { lorId },
    });
  }
}
