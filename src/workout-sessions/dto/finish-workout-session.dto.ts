import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FinishWorkoutSessionDto {
  @ApiPropertyOptional({ example: '2026-05-26T09:42:30.000Z' })
  @IsOptional()
  @IsDateString()
  clientFinishedAt?: string;
}
