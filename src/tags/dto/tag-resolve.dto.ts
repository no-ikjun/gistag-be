import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagResolveDto {
  @ApiProperty({ example: 'GISTAG_TAG_DEMO_001' })
  @IsString()
  @IsNotEmpty()
  tagCode!: string;

  @ApiPropertyOptional({
    example: '04:A1:B2:C3:D4:E5:F6',
    description: '기기에서 읽을 수 있는 경우에만 전달하는 보조 하드웨어 UID',
  })
  @IsOptional()
  @IsString()
  hardwareUid?: string;
}
