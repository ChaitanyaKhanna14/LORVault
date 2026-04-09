import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'LORVault <noreply@lorvault.app>',
    );
    this.enabled = !!apiKey;

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service initialized with Resend');
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set - emails will be logged but not sent',
      );
    }
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    if (!this.enabled || !this.resend) {
      this.logger.log(
        `[DEV MODE] Would send email to ${Array.isArray(to) ? to.join(', ') : to}: ${subject}`,
      );
      this.logger.debug(`Email content: ${text || html}`);
      return true; // Return success in dev mode
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
        return false;
      }

      this.logger.log(`Email sent successfully: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Email sending failed: ${error}`);
      return false;
    }
  }

  async sendTeacherInvite(
    email: string,
    name: string,
    institutionName: string,
    temporaryPassword: string,
  ): Promise<boolean> {
    const subject = `You've been invited to LORVault by ${institutionName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LORVault!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p><strong>${institutionName}</strong> has invited you to join LORVault as a Teacher. You can now upload and manage Letters of Recommendation for your students.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            </div>
            
            <p>⚠️ Please change your password after your first login for security.</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://lorvault.app/login" class="btn">Login to LORVault</a>
            </p>
            
            <div class="footer">
              <p>If you didn't expect this invitation, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} LORVault. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${name},

${institutionName} has invited you to join LORVault as a Teacher.

Your Login Credentials:
- Email: ${email}
- Temporary Password: ${temporaryPassword}

Please change your password after your first login for security.

Login at: https://lorvault.app/login

If you didn't expect this invitation, please ignore this email.
    `.trim();

    return this.send({ to: email, subject, html, text });
  }

  async sendPasswordReset(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `https://lorvault.app/reset-password?token=${resetToken}`;
    const subject = 'Reset your LORVault password';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We received a request to reset your LORVault password. Click the button below to create a new password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} LORVault. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${name},

We received a request to reset your LORVault password.

Reset your password: ${resetUrl}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.
    `.trim();

    return this.send({ to: email, subject, html, text });
  }

  async sendLorNotification(
    email: string,
    studentName: string,
    teacherName: string,
    action: 'uploaded' | 'approved' | 'rejected',
  ): Promise<boolean> {
    const actionText = {
      uploaded: `${teacherName} has uploaded a new Letter of Recommendation for you`,
      approved: `Your Letter of Recommendation from ${teacherName} has been approved`,
      rejected: `Your Letter of Recommendation from ${teacherName} requires attention`,
    };

    const subject = `LOR Update: ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LOR Update</h1>
          </div>
          <div class="content">
            <p>Hello ${studentName},</p>
            <p>${actionText[action]}.</p>
            <p>Log in to LORVault to view details.</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://lorvault.app" class="btn">View in LORVault</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({ to: email, subject, html });
  }
}
