import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { InstitutionModule } from './institution/institution.module';
import { LorModule } from './lor/lor.module';
import { PdfModule } from './pdf/pdf.module';
import { HashModule } from './hash/hash.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { VerificationModule } from './verification/verification.module';
import { NotificationModule } from './notification/notification.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    InstitutionModule,
    LorModule,
    PdfModule,
    HashModule,
    BlockchainModule,
    VerificationModule,
    NotificationModule,
    FileModule,
  ],
})
export class AppModule {}
