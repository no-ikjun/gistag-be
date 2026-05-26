import { ApiProperty } from '@nestjs/swagger';

export class RecentWorkoutRecordItemDto {
  @ApiProperty({ example: '9b8c3a3e-6e10-4d77-8a2a-9f1b6a3a92cd' })
  id!: string;

  @ApiProperty({ example: 'GIST 체육관' })
  placeName!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startedAt!: Date;

  @ApiProperty({ example: 1800 })
  durationSeconds!: number;

  @ApiProperty({ example: 120 })
  earnedXp!: number;
}

export class RecentWorkoutRecordsResponseDto {
  @ApiProperty({ type: RecentWorkoutRecordItemDto, isArray: true })
  items!: RecentWorkoutRecordItemDto[];
}
