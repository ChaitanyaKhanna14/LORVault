import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import { LoginDto, RegisterStudentDto, RegisterExternalDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { institution: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update status if still invited
    if (user.status === UserStatus.INVITED) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.REGISTERED,
          registeredAt: new Date(),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role, user.institutionId);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async registerStudent(dto: RegisterStudentDto) {
    // Find institution by code
    const institution = await this.prisma.institution.findUnique({
      where: { code: dto.institutionCode },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if student ID is already used in this institution
    const existingStudentId = await this.prisma.user.findFirst({
      where: {
        studentId: dto.studentId,
        institutionId: institution.id,
      },
    });

    if (existingStudentId) {
      throw new ConflictException('Student ID already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: Role.STUDENT,
        studentId: dto.studentId,
        institutionId: institution.id,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
      },
      include: { institution: true },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.institutionId);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async registerExternal(dto: RegisterExternalDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: Role.EXTERNAL,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
      },
    });

    const tokens = await this.generateTokens(user.id, user.role, null);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: { include: { institution: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const { user } = storedToken;
    const tokens = await this.generateTokens(user.id, user.role, user.institutionId);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, role: Role, institutionId: string | null) {
    const payload = { sub: userId, role, institutionId };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiry));

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
