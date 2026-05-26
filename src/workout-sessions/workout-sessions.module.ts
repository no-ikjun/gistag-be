import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSessionsService } from './workout-sessions.service';

@Module({
  imports: [AuthModule],
  controllers: [WorkoutSessionsController],
  providers: [WorkoutSessionsService],
  exports: [WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
