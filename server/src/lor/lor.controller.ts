import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { LorService } from './lor.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, LorStatus } from '@prisma/client';

@Controller('lors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LorController {
  constructor(private lorService: LorService) {}

  @Post()
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('pdf'))
  async create(
    @CurrentUser() user: { id: string; institutionId: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; subject: string; studentId: string },
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    return this.lorService.create({
      title: body.title,
      subject: body.subject,
      studentId: body.studentId,
      teacherId: user.id,
      institutionId: user.institutionId,
      pdfBuffer: file.buffer,
      originalFilename: file.originalname,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: { id: string; role: Role; institutionId: string },
    @Query('status') status?: LorStatus,
  ) {
    return this.lorService.findAll(user.id, user.role, user.institutionId, { status });
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; institutionId: string },
  ) {
    return this.lorService.findById(id, user.id, user.role, user.institutionId);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  async approve(
    @Param('id') id: string,
    @CurrentUser('institutionId') institutionId: string,
  ) {
    return this.lorService.approve(id, institutionId);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  async reject(
    @Param('id') id: string,
    @CurrentUser('institutionId') institutionId: string,
    @Body() body: { reason: string },
  ) {
    return this.lorService.reject(id, institutionId, body.reason);
  }

  @Patch(':id/revoke')
  @Roles(Role.ADMIN, Role.TEACHER)
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; institutionId: string },
    @Body() body: { reason: string },
  ) {
    return this.lorService.revoke(id, user.id, user.role, user.institutionId, body.reason);
  }

  @Post(':id/acknowledge')
  @Roles(Role.STUDENT)
  async acknowledge(
    @Param('id') id: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.lorService.acknowledge(id, studentId);
  }

  @Get(':id/pdf')
  async getPdf(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; institutionId: string },
    @Query('type') type: 'original' | 'canonical' = 'canonical',
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.lorService.getPdfBuffer(id, user.id, user.role, user.institutionId, type);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="lor-${id}.pdf"`,
    });

    res.send(pdfBuffer);
  }

  @Get(':id/share-link')
  @Roles(Role.STUDENT)
  async getShareLink(
    @Param('id') id: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.lorService.generateShareLink(id, studentId);
  }
}
