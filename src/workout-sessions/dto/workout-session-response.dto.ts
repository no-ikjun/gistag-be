import { ApiProperty } from '@nestjs/swagger';

export class WorkoutSessionPlaceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GIST 체육관' })
  name!: string;

  @ApiProperty({ nullable: true, example: 'GYM' })
  category!: string | null;
}

export class WorkoutSessionStartedByTagDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GISTAG_TAG_DEMO_001' })
  code!: string;
}

export class WorkoutSessionDto {
  @ApiProperty({ example: '9b8c3a3e-6e10-4d77-8a2a-9f1b6a3a92cd' })
  id!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startedAt!: Date;

  @ApiProperty({ type: WorkoutSessionPlaceDto })
  place!: WorkoutSessionPlaceDto;

  @ApiProperty({ type: WorkoutSessionStartedByTagDto, required: false })
  startedByTag?: WorkoutSessionStartedByTagDto;
}

export class ActiveWorkoutSessionResponseDto {
  @ApiProperty({ type: WorkoutSessionDto, nullable: true })
  session!: WorkoutSessionDto | null;
}

export class StartWorkoutSessionResponseDto {
  @ApiProperty({ type: WorkoutSessionDto })
  session!: WorkoutSessionDto;
}
