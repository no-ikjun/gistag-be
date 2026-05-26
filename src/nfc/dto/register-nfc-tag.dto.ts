import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RegisterNfcTagDto {
  @ApiProperty({ example: 'GISTAG_TAG_123ABC' })
  @IsString()
  @IsNotEmpty()
  tagCode!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  placeId?: number;

  @ApiPropertyOptional({ example: '04:A1:B2:C3:D4:E5:F6' })
  @IsOptional()
  @IsString()
  hardwareUid?: string;

  @ApiPropertyOptional({ example: 'gistag://tag/GISTAG_TAG_123ABC' })
  @IsOptional()
  @IsString()
  ndefPayload?: string;

  @ApiPropertyOptional({ example: 'URI' })
  @IsOptional()
  @IsString()
  ndefType?: string;

  @ApiPropertyOptional({ example: ['NFC_A', 'NDEF'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techTypes?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isWritable?: boolean;

  @ApiPropertyOptional({ example: 144 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4096)
  maxSizeBytes?: number;
}
