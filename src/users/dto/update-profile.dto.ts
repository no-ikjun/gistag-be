import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EXERCISE_TYPES } from '../constants/exercise-type.constants';

export class UpdateProfileDto {
  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'undisclosed'] })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other', 'undisclosed'])
  gender?: 'male' | 'female' | 'other' | 'undisclosed';

  @ApiPropertyOptional({ type: String, isArray: true, enum: EXERCISE_TYPES })
  @ValidateIf((o: UpdateProfileDto) => o.exerciseTypes !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(EXERCISE_TYPES, { each: true })
  exerciseTypes?: (typeof EXERCISE_TYPES)[number][];

  @ApiPropertyOptional({
    enum: ['daily', '3_4_per_week', '1_2_per_week', 'rarely'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', '3_4_per_week', '1_2_per_week', 'rarely'])
  exerciseFrequency?: 'daily' | '3_4_per_week' | '1_2_per_week' | 'rarely';
}
