import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @ApiPropertyOptional({ example: '헬스' })
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
}

export class AdminTagMetadataDto {
  @ApiPropertyOptional({ example: ['NfcA', 'Ndef'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({ example: 'gistag://tag/04A1B2C3D4E5F6', nullable: true })
  @IsOptional()
  @IsString()
  ndefPayload?: string | null;
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
