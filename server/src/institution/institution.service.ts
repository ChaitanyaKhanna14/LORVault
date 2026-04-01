import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstitutionService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; code: string; domain?: string; logoUrl?: string }) {
    const existing = await this.prisma.institution.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Institution code already exists');
    }

    return this.prisma.institution.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.institution.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            lors: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            lors: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    return institution;
  }

  async findByCode(code: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { code },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    return institution;
  }

  async update(id: string, data: { name?: string; domain?: string; logoUrl?: string }) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    return this.prisma.institution.update({
      where: { id },
      data,
    });
  }

  async createFirstAdmin(institutionId: string, data: { email: string; fullName: string; password: string }) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    // Check if admin already exists
    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        institutionId,
        role: Role.ADMIN,
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Institution already has an admin');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        role: Role.ADMIN,
        institutionId,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
      },
    });

    const { passwordHash: _, ...sanitized } = admin;
    return sanitized;
  }

  async getStats(institutionId: string) {
    const [totalLors, pendingLors, approvedLors, rejectedLors, totalTeachers, totalStudents] = await Promise.all([
      this.prisma.lor.count({ where: { institutionId } }),
      this.prisma.lor.count({ where: { institutionId, status: 'SUBMITTED' } }),
      this.prisma.lor.count({ where: { institutionId, status: 'APPROVED' } }),
      this.prisma.lor.count({ where: { institutionId, status: 'REJECTED' } }),
      this.prisma.user.count({ where: { institutionId, role: Role.TEACHER } }),
      this.prisma.user.count({ where: { institutionId, role: Role.STUDENT } }),
    ]);

    return {
      totalLors,
      pendingLors,
      approvedLors,
      rejectedLors,
      totalTeachers,
      totalStudents,
    };
  }
}
