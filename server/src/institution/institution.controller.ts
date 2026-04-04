import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InstitutionService } from './institution.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('institutions')
export class InstitutionController {
  constructor(private institutionService: InstitutionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() body: { name: string; code: string; domain?: string; logoUrl?: string }) {
    return this.institutionService.create(body);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async findAll() {
    return this.institutionService.findAll();
  }

  @Get('my-stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getMyStats(@CurrentUser('institutionId') institutionId: string) {
    return this.institutionService.getStats(institutionId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async findById(@Param('id') id: string) {
    return this.institutionService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; domain?: string; logoUrl?: string },
  ) {
    return this.institutionService.update(id, body);
  }

  @Post(':id/admins')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createFirstAdmin(
    @Param('id') institutionId: string,
    @Body() body: { email: string; fullName: string; password: string },
  ) {
    return this.institutionService.createFirstAdmin(institutionId, body);
  }
}
