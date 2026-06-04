import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class StartWorkoutSessionDto {
  @ApiProperty({
    example: '5343EF15950001',
    description:
      'resolve 응답의 tag.code 값. NDEF tag_code 또는 UID 기반 hardware_uid 모두 허용',
  })
  @IsString()
  @IsNotEmpty()
  tagCode!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  placeId!: number;
}
