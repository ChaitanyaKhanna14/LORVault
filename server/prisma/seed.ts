import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@lorvault.app';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'changeme123';

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        fullName: 'Super Admin',
        role: Role.SUPER_ADMIN,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
      },
    });

    console.log(`✅ Created super admin: ${superAdmin.email}`);
  } else {
    console.log(`ℹ️  Super admin already exists: ${existingSuperAdmin.email}`);
  }

  // Create a demo institution
  const demoInstitution = await prisma.institution.upsert({
    where: { code: 'DEMO-2026' },
    update: {},
    create: {
      name: 'Demo University',
      code: 'DEMO-2026',
      domain: 'demo.edu',
    },
  });

  console.log(`✅ Demo institution: ${demoInstitution.name} (${demoInstitution.code})`);

  // Create demo admin for the institution
  const demoAdminEmail = 'admin@demo.edu';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: demoAdminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const demoAdmin = await prisma.user.create({
      data: {
        email: demoAdminEmail,
        passwordHash,
        fullName: 'Demo Admin',
        role: Role.ADMIN,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
        institutionId: demoInstitution.id,
      },
    });

    console.log(`✅ Created demo admin: ${demoAdmin.email}`);
  }

  // Create demo teacher
  const demoTeacherEmail = 'teacher@demo.edu';
  const existingTeacher = await prisma.user.findUnique({
    where: { email: demoTeacherEmail },
  });

  if (!existingTeacher) {
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const demoTeacher = await prisma.user.create({
      data: {
        email: demoTeacherEmail,
        passwordHash,
        fullName: 'Dr. John Smith',
        role: Role.TEACHER,
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
        institutionId: demoInstitution.id,
      },
    });

    console.log(`✅ Created demo teacher: ${demoTeacher.email}`);
  }

  // Create demo student
  const demoStudentEmail = 'student@demo.edu';
  const existingStudent = await prisma.user.findUnique({
    where: { email: demoStudentEmail },
  });

  if (!existingStudent) {
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const demoStudent = await prisma.user.create({
      data: {
        email: demoStudentEmail,
        passwordHash,
        fullName: 'Jane Doe',
        role: Role.STUDENT,
        studentId: 'STU001',
        status: UserStatus.REGISTERED,
        registeredAt: new Date(),
        institutionId: demoInstitution.id,
      },
    });

    console.log(`✅ Created demo student: ${demoStudent.email}`);
  }

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Demo accounts (password: demo123):');
  console.log('  - Super Admin: admin@lorvault.app (password: changeme123)');
  console.log('  - Admin: admin@demo.edu');
  console.log('  - Teacher: teacher@demo.edu');
  console.log('  - Student: student@demo.edu (ID: STU001)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
