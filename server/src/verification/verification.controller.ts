import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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

  // Get verification history for external verifier (by email)
  @Get('history/my')
  @UseGuards(AuthGuard('jwt'))
  async getMyHistory(
    @CurrentUser() user: any,
    @Query('email') email?: string,
  ) {
    const searchEmail = email || user.email;
    return this.verificationService.getHistoryByEmail(searchEmail);
  }

  // Public endpoint - no auth required (from QR code)
  @Get(':lorId')
  async verifyByLorId(@Param('lorId') lorId: string) {
    return this.verificationService.verifyByLorId(lorId);
  }
}
