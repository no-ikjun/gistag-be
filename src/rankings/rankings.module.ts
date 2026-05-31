import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [AuthModule],
  controllers: [RankingsController],
  providers: [RankingsService],
})
export class RankingsModule {}
