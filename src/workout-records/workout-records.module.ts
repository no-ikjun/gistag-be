import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorkoutRecordsController } from './workout-records.controller';
import { WorkoutRecordsService } from './workout-records.service';

@Module({
  imports: [AuthModule],
  controllers: [WorkoutRecordsController],
  providers: [WorkoutRecordsService],
})
export class WorkoutRecordsModule {}
