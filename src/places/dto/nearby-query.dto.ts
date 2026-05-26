import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class NearbyQueryDto {
  @ApiProperty({ example: 35.2131, description: '사용자 위도' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 126.8378, description: '사용자 경도' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiProperty({
    example: 1.5,
    minimum: 0.1,
    maximum: 50,
    description: '조회 반경(km)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius!: number;
}
