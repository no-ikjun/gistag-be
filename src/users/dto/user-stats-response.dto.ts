import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
  @ApiProperty({ example: 'fd7a0364-1711-41b2-82a3-a0c1147db0ab' })
  userId!: string;

  @ApiProperty({ example: 3 })
  level!: number;

  @ApiProperty({ example: 940 })
  totalXp!: number;

  @ApiProperty({ example: 240, description: '현재 레벨 안에서의 누적 XP' })
  xpInCurrentLevel!: number;

  @ApiProperty({ example: 60, description: '다음 레벨까지 남은 XP' })
  xpToNextLevel!: number;

  @ApiProperty({ example: 300, description: '한 레벨업에 필요한 XP (상수)' })
  xpPerLevel!: number;

  @ApiProperty({ example: 5 })
  currentStreak!: number;

  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-05-31',
    description: '마지막 운동 KST 날짜 (YYYY-MM-DD), 운동 이력 없으면 null',
  })
  lastWorkoutDate!: string | null;

  @ApiProperty({ example: 12, description: '완료된 운동 세션 수' })
  totalWorkouts!: number;

  @ApiProperty({ example: 21600, description: '총 운동 시간(초)' })
  totalDurationSeconds!: number;
}
