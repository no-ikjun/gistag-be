import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagResolveDto {
  @ApiProperty({ example: '04A1B2C3D4E5F6' })
  @IsString()
  @IsNotEmpty()
  hardwareUid!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: null,
    description: '읽을 수 있으면 함께 전달하는 보조 NDEF payload',
  })
  @IsOptional()
  @IsString()
  ndefPayload?: string | null;
}
