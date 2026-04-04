import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Role } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: NotificationType, title: string, body: string, lorId?: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        lorId,
      },
    });
  }

  async getForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  // Helper methods for specific notification types
  async notifyLorSubmitted(lor: any) {
    // Notify student
    await this.create(
      lor.studentId,
      NotificationType.LOR_SUBMITTED,
      'New Letter of Recommendation',
      `${lor.teacher.fullName} has submitted a letter of recommendation for you: "${lor.title}"`,
      lor.id,
    );

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: {
        institutionId: lor.institutionId,
        role: Role.ADMIN,
      },
    });

    for (const admin of admins) {
      await this.create(
        admin.id,
        NotificationType.LOR_SUBMITTED,
        'New LOR Pending Review',
        `${lor.teacher.fullName} submitted an LOR for ${lor.student.fullName}`,
        lor.id,
      );
    }
  }

  async notifyLorApproved(lor: any) {
    // Notify teacher
    await this.create(
      lor.teacherId,
      NotificationType.LOR_APPROVED,
      'LOR Approved',
      `Your letter of recommendation for ${lor.student.fullName} has been approved`,
      lor.id,
    );

    // Notify student
    await this.create(
      lor.studentId,
      NotificationType.LOR_APPROVED,
      'LOR Approved',
      `Your letter of recommendation from ${lor.teacher.fullName} has been approved`,
      lor.id,
    );

    // Request consent
    await this.create(
      lor.studentId,
      NotificationType.CONSENT_REQUIRED,
      'Consent Required',
      'Please acknowledge your letter of recommendation to enable sharing',
      lor.id,
    );
  }

  async notifyLorRejected(lor: any) {
    await this.create(
      lor.teacherId,
      NotificationType.LOR_REJECTED,
      'LOR Rejected',
      `Your letter of recommendation for ${lor.student.fullName} has been rejected. Reason: ${lor.rejectionReason}`,
      lor.id,
    );
  }

  async notifyLorRevoked(lor: any) {
    // Notify teacher
    await this.create(
      lor.teacherId,
      NotificationType.LOR_REVOKED,
      'LOR Revoked',
      `The letter of recommendation for ${lor.student.fullName} has been revoked`,
      lor.id,
    );

    // Notify student
    await this.create(
      lor.studentId,
      NotificationType.LOR_REVOKED,
      'LOR Revoked',
      `Your letter of recommendation from ${lor.teacher.fullName} has been revoked`,
      lor.id,
    );
  }
}
