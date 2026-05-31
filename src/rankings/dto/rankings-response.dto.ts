import { ApiProperty } from '@nestjs/swagger';

export class RankingItemDto {
  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiProperty({ example: 'fd7a0364-1711-41b2-82a3-a0c1147db0ab' })
  userId!: string;

  @ApiProperty({ example: 'alice' })
  nickname!: string;

  @ApiProperty({ example: 5 })
  level!: number;

  @ApiProperty({ example: 1480 })
  totalXp!: number;

  @ApiProperty({ example: 7 })
  currentStreak!: number;
}

export class RankingsResponseDto {
  @ApiProperty({ type: RankingItemDto, isArray: true })
  items!: RankingItemDto[];

  @ApiProperty({ type: RankingItemDto, nullable: true })
  me!: RankingItemDto | null;

  @ApiProperty({ example: 128 })
  total!: number;
}
