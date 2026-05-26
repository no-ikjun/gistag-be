import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NfcController } from './nfc.controller';
import { NfcService } from './nfc.service';

@Module({
  imports: [AuthModule],
  controllers: [NfcController],
  providers: [NfcService],
})
export class NfcModule {}
