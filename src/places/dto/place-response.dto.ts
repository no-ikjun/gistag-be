import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaceResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '제2학생회관 헬스장' })
  placeName!: string;

  @ApiProperty({ nullable: true, example: '캠퍼스 내 헬스장' })
  description!: string | null;

  @ApiProperty({ nullable: true, example: 'gym' })
  category!: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.com/image.jpg' })
  imageUrl!: string | null;

  @ApiProperty({ nullable: true, example: 35.2131 })
  latitude!: number | null;

  @ApiProperty({ nullable: true, example: 126.8378 })
  longitude!: number | null;

  @ApiProperty({ nullable: true, example: '도보 약 5분' })
  distanceText!: string | null;

  @ApiProperty({
    nullable: true,
    example: 60,
    description: '예상 소요 시간(분)',
  })
  estimatedDurationMinutes!: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({
    example: 0.42,
    description: 'lat/lng 쿼리 사용 시, 사용자 위치로부터의 거리(km)',
  })
  distanceKm?: number;
}
