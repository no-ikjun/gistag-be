import { ApiProperty } from '@nestjs/swagger';

export class ResolvedTagDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: '04A1B2C3D4E5F6',
    description: '하드웨어 UID. 태그를 식별하는 1차 키',
  })
  code!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class ResolvedPlaceDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 'GIST 체육관' })
  name!: string;

  @ApiProperty({ nullable: true, example: '되는지 테스트' })
  description!: string | null;

  @ApiProperty({ nullable: true, example: '헬스' })
  workoutType!: string | null;

  @ApiProperty({ nullable: true, example: 35.2131 })
  latitude!: number | null;

  @ApiProperty({ nullable: true, example: 126.8378 })
  longitude!: number | null;

  @ApiProperty({ nullable: true, example: '기숙사에서 5분' })
  distanceText!: string | null;

  @ApiProperty({ nullable: true, example: 60 })
  estimatedDurationMinutes!: number | null;
}

export class TagResolveResponseDto {
  @ApiProperty({ type: ResolvedTagDto })
  tag!: ResolvedTagDto;

  @ApiProperty({ type: ResolvedPlaceDto })
  place!: ResolvedPlaceDto;

  @ApiProperty({ example: true })
  canStartWorkout!: boolean;

  @ApiProperty({ nullable: true, example: null })
  blockedReason!: string | null;
}
