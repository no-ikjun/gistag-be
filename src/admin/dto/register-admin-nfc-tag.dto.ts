import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AdminPlaceCreateDto {
  @ApiProperty({ example: 'GIST 체육관' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '시연용 운동 장소' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: '헬스',
    description: 'DB 컬럼 places.category 와 매핑됩니다.',
  })
  @IsOptional()
  @IsString()
  workoutType?: string | null;

  @ApiPropertyOptional({ example: 35.2131 })
  @IsOptional()
  @IsLatitude()
  latitude?: number | null;

  @ApiPropertyOptional({ example: 126.8378 })
  @IsOptional()
  @IsLongitude()
  longitude?: number | null;

  @ApiPropertyOptional({
    example: 'https://cdn.gistag.app/places/gym.jpg',
    description: '장소 카드 이미지 URL',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: '도보 약 5분',
    description: '거리/시간 안내 문구 (places.distance_text)',
  })
  @IsOptional()
  @IsString()
  distanceText?: string | null;

  @ApiPropertyOptional({ example: 60, description: '예상 소요 시간(분)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedDurationMinutes?: number | null;

  @ApiPropertyOptional({
    example: 0,
    description: '홈 정렬 순서 (낮을수록 위)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: true,
    description: '추천 장소 노출 여부 (기본값 true)',
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;
}

export class AdminTagMetadataDto {
  @ApiPropertyOptional({ example: ['NfcA', 'Ndef'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    example: 'gistag://tag/04A1B2C3D4E5F6',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  ndefPayload?: string | null;

  @ApiPropertyOptional({
    example: 'URI',
    description: 'NDEF record 타입 (URI / TEXT 등)',
  })
  @IsOptional()
  @IsString()
  ndefType?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isWritable?: boolean | null;

  @ApiPropertyOptional({ example: 144, description: 'NFC 칩 최대 용량(bytes)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(65535)
  maxSizeBytes?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'hardwareUid 의 사전 해시값. 비워 두면 서버는 저장하지 않습니다.',
  })
  @IsOptional()
  @IsString()
  hardwareUidHash?: string | null;
}

export class RegisterAdminNfcTagDto {
  @ApiProperty({ example: '04A1B2C3D4E5F6' })
  @IsString()
  @IsNotEmpty()
  hardwareUid!: string;

  @ApiProperty({ type: AdminPlaceCreateDto })
  @ValidateNested()
  @Type(() => AdminPlaceCreateDto)
  place!: AdminPlaceCreateDto;

  @ApiPropertyOptional({ type: AdminTagMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminTagMetadataDto)
  tagMetadata?: AdminTagMetadataDto;
}
