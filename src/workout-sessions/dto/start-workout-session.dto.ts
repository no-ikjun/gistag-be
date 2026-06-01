import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class StartWorkoutSessionDto {
  @ApiProperty({
    example: '04A1B2C3D4E5F6',
    description: 'NFC 태그의 하드웨어 UID (resolve 응답의 tag.code 값)',
  })
  @IsString()
  @IsNotEmpty()
  hardwareUid!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  placeId!: number;
}
