import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { institution: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { institution: true },
    });
  }

  async getStudentsInInstitution(institutionId: string) {
    return this.prisma.user.findMany({
      where: {
        institutionId,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        status: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async getTeachersInInstitution(institutionId: string) {
    return this.prisma.user.findMany({
      where: {
        institutionId,
        role: Role.TEACHER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async inviteTeacher(institutionId: string, email: string, fullName: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Get institution name for email
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { name: true },
    });

    // Generate temporary password
    const tempPassword = uuidv4().slice(0, 8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const teacher = await this.prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: Role.TEACHER,
        institutionId,
        status: UserStatus.INVITED,
        invitedAt: new Date(),
      },
    });

    // Send invitation email
    const emailSent = await this.emailService.sendTeacherInvite(
      email,
      fullName,
      institution?.name || 'Your Institution',
      tempPassword,
    );

    if (!emailSent) {
      this.logger.warn(`Failed to send invitation email to ${email}`);
    }

    return {
      id: teacher.id,
      email: teacher.email,
      fullName: teacher.fullName,
      tempPassword, // Return for dev/testing; in production email is the primary delivery
    };
  }

  async addStudentToRoster(institutionId: string, email: string, fullName: string, studentId: string) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingStudentId = await this.prisma.user.findFirst({
      where: {
        studentId,
        institutionId,
      },
    });

    if (existingStudentId) {
      throw new ConflictException('Student ID already exists in this institution');
    }

    // Create placeholder with random password (student will set their own on registration)
    const placeholderPassword = uuidv4();
    const passwordHash = await bcrypt.hash(placeholderPassword, 10);

    const student = await this.prisma.user.create({
      data: {
        email,
        fullName,
        studentId,
        passwordHash,
        role: Role.STUDENT,
        institutionId,
        status: UserStatus.INVITED,
        invitedAt: new Date(),
      },
    });

    return {
      id: student.id,
      email: student.email,
      fullName: student.fullName,
      studentId: student.studentId,
    };
  }

  async importStudentsFromCSV(institutionId: string, students: Array<{ email: string; fullName: string; studentId: string }>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const student of students) {
      try {
        await this.addStudentToRoster(institutionId, student.email, student.fullName, student.studentId);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${student.email}: ${error.message}`);
      }
    }

    return results;
  }

  async updateProfile(userId: string, data: { fullName?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { institution: true },
    });

    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
