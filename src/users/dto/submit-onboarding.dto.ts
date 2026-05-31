import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { EXERCISE_TYPES } from '../constants/exercise-type.constants';

export class SubmitOnboardingDto {
  @ApiProperty({ enum: ['male', 'female', 'other', 'undisclosed'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['male', 'female', 'other', 'undisclosed'])
  gender!: 'male' | 'female' | 'other' | 'undisclosed';

  @ApiProperty({ type: String, isArray: true, enum: EXERCISE_TYPES })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(EXERCISE_TYPES, { each: true })
  exerciseTypes!: (typeof EXERCISE_TYPES)[number][];

  @ApiProperty({ enum: ['daily', '3_4_per_week', '1_2_per_week', 'rarely'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['daily', '3_4_per_week', '1_2_per_week', 'rarely'])
  exerciseFrequency!: 'daily' | '3_4_per_week' | '1_2_per_week' | 'rarely';
}
