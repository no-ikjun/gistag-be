import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class StartWorkoutSessionDto {
  @ApiProperty({ example: 'GISTAG_TAG_DEMO_001' })
  @IsString()
  @IsNotEmpty()
  tagCode!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  placeId!: number;
}
