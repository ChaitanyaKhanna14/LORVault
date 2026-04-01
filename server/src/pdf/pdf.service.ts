import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfService {
  constructor(private configService: ConfigService) {}

  async addQrFooter(pdfBuffer: Buffer, lorId: string, institutionName: string): Promise<Buffer> {
    // Load existing PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Generate QR code
    const verifyUrl = `${this.configService.get('APP_URL')}/api/verify/${lorId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Convert data URL to buffer
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Get the last page
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Footer dimensions
    const footerHeight = 80;
    const qrSize = 60;
    const padding = 15;

    // Draw footer background
    lastPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: footerHeight,
      color: rgb(0.95, 0.95, 0.95),
    });

    // Draw border line
    lastPage.drawLine({
      start: { x: 0, y: footerHeight },
      end: { x: width, y: footerHeight },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Draw QR code
    lastPage.drawImage(qrCodeImage, {
      x: padding,
      y: (footerHeight - qrSize) / 2,
      width: qrSize,
      height: qrSize,
    });

    // Draw text
    const textX = padding + qrSize + 15;
    const textColor = rgb(0.2, 0.2, 0.2);

    lastPage.drawText('Verified by LORVault', {
      x: textX,
      y: footerHeight - 25,
      size: 12,
      font: fontBold,
      color: textColor,
    });

    lastPage.drawText(`Institution: ${institutionName}`, {
      x: textX,
      y: footerHeight - 42,
      size: 9,
      font: font,
      color: textColor,
    });

    lastPage.drawText(`LOR ID: ${lorId}`, {
      x: textX,
      y: footerHeight - 55,
      size: 8,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });

    lastPage.drawText('Scan QR code to verify authenticity', {
      x: textX,
      y: footerHeight - 68,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  }
}
