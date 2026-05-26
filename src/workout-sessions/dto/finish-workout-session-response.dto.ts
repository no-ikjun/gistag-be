import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutSessionPlaceDto } from './workout-session-response.dto';

export class FinishedWorkoutRecordDto {
  @ApiProperty({ example: '9b8c3a3e-6e10-4d77-8a2a-9f1b6a3a92cd' })
  id!: string;

  @ApiProperty({ example: '9b8c3a3e-6e10-4d77-8a2a-9f1b6a3a92cd' })
  sessionId!: string;

  @ApiProperty({ type: WorkoutSessionPlaceDto })
  place!: WorkoutSessionPlaceDto;

  @ApiProperty({ type: String, format: 'date-time' })
  startedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  finishedAt!: Date;

  @ApiProperty({ example: 1800 })
  durationSeconds!: number;

  @ApiProperty({ example: 120 })
  earnedXp!: number;
}

export class WorkoutRewardDto {
  @ApiProperty({ example: 120 })
  earnedXp!: number;

  @ApiProperty({ example: 940 })
  totalXp!: number;

  @ApiProperty({ example: 3 })
  level!: number;

  @ApiProperty({ example: 5 })
  streakDays!: number;

  @ApiProperty({ example: true })
  streakUpdated!: boolean;
}

export class FinishWorkoutSessionResponseDto {
  @ApiProperty({ type: FinishedWorkoutRecordDto })
  record!: FinishedWorkoutRecordDto;

  @ApiProperty({ type: WorkoutRewardDto })
  reward!: WorkoutRewardDto;

  @ApiPropertyOptional({ example: true })
  alreadyFinished?: boolean;
}
