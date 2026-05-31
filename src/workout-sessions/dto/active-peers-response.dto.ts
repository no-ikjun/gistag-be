import { ApiProperty } from '@nestjs/swagger';
import { WorkoutSessionPlaceDto } from './workout-session-response.dto';

export class ActivePeerItemDto {
  @ApiProperty({ example: 'fd7a0364-1711-41b2-82a3-a0c1147db0ab' })
  userId!: string;

  @ApiProperty({ example: 'bob' })
  nickname!: string;

  @ApiProperty({ example: 3 })
  level!: number;

  @ApiProperty({ example: 720 })
  totalXp!: number;

  @ApiProperty({ example: 4 })
  currentStreak!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  sessionStartedAt!: Date;

  @ApiProperty({ example: 1740 })
  durationSeconds!: number;
}

export class ActivePeersResponseDto {
  @ApiProperty({ type: WorkoutSessionPlaceDto, nullable: true })
  place!: WorkoutSessionPlaceDto | null;

  @ApiProperty({ type: ActivePeerItemDto, isArray: true })
  items!: ActivePeerItemDto[];
}
