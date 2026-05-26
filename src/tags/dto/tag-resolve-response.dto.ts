import { ApiProperty } from '@nestjs/swagger';

export class ResolvedTagDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GISTAG_TAG_DEMO_001' })
  code!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class ResolvedPlaceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GIST 체육관' })
  name!: string;

  @ApiProperty({
    nullable: true,
    example: '실내 운동을 기록할 수 있는 장소입니다.',
  })
  description!: string | null;

  @ApiProperty({ nullable: true, example: 'GYM' })
  category!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://cdn.gistag.app/places/gym.jpg',
  })
  imageUrl!: string | null;
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
