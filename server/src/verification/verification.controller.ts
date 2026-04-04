import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';

@Controller('verify')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // Public endpoint - no auth required
  @Post('upload')
  @UseInterceptors(FileInterceptor('pdf'))
  async verifyByUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { verifierEmail?: string; verifierInstitution?: string },
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    return this.verificationService.verifyByUpload({
      pdfBuffer: file.buffer,
      verifierEmail: body.verifierEmail,
      verifierInstitution: body.verifierInstitution,
    });
  }

  // Public endpoint - no auth required (from QR code)
  @Get(':lorId')
  async verifyByLorId(@Param('lorId') lorId: string) {
    return this.verificationService.verifyByLorId(lorId);
  }
}
