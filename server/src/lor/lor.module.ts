import { Module } from '@nestjs/common';
import { LorService } from './lor.service';
import { LorController } from './lor.controller';
import { PdfModule } from '../pdf/pdf.module';
import { HashModule } from '../hash/hash.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PdfModule, HashModule, BlockchainModule, FileModule, NotificationModule],
  providers: [LorService],
  controllers: [LorController],
  exports: [LorService],
})
export class LorModule {}
