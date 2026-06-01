import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminNfcTagsController } from './admin-nfc-tags.controller';
import { AdminNfcTagsService } from './admin-nfc-tags.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminNfcTagsController],
  providers: [AdminNfcTagsService],
})
export class AdminModule {}
