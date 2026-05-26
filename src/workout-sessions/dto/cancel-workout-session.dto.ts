import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelWorkoutSessionDto {
  @ApiPropertyOptional({ example: 'USER_CANCELLED' })
  @IsOptional()
  @IsString()
  reason?: string;
}
