import { Controller, Get, Post, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() body: { fullName?: string },
  ) {
    return this.userService.updateProfile(userId, body);
  }

  @Get('students')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getStudents(@CurrentUser('institutionId') institutionId: string) {
    return this.userService.getStudentsInInstitution(institutionId);
  }

  @Get('teachers')
  @Roles(Role.ADMIN)
  async getTeachers(@CurrentUser('institutionId') institutionId: string) {
    return this.userService.getTeachersInInstitution(institutionId);
  }

  @Post('invite/teacher')
  @Roles(Role.ADMIN)
  async inviteTeacher(
    @CurrentUser('institutionId') institutionId: string,
    @Body() body: { email: string; fullName: string },
  ) {
    return this.userService.inviteTeacher(institutionId, body.email, body.fullName);
  }

  @Post('students')
  @Roles(Role.ADMIN)
  async addStudent(
    @CurrentUser('institutionId') institutionId: string,
    @Body() body: { email: string; fullName: string; studentId: string },
  ) {
    return this.userService.addStudentToRoster(institutionId, body.email, body.fullName, body.studentId);
  }

  @Post('students/import')
  @Roles(Role.ADMIN)
  async importStudents(
    @CurrentUser('institutionId') institutionId: string,
    @Body() body: { students: Array<{ email: string; fullName: string; studentId: string }> },
  ) {
    return this.userService.importStudentsFromCSV(institutionId, body.students);
  }
}
