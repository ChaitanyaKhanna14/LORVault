import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { HashModule } from '../hash/hash.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [HashModule, BlockchainModule, FileModule],
  providers: [VerificationService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
