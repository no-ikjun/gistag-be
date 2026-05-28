import { ApiProperty } from '@nestjs/swagger';
import { EXERCISE_TYPES } from '../constants/exercise-type.constants';

export class UserProfileDto {
  @ApiProperty({ enum: ['male', 'female', 'other', 'undisclosed'] })
  gender!: 'male' | 'female' | 'other' | 'undisclosed';

  @ApiProperty({ type: String, isArray: true, enum: EXERCISE_TYPES })
  exerciseTypes!: (typeof EXERCISE_TYPES)[number][];

  @ApiProperty({ enum: ['daily', '3_4_per_week', '1_2_per_week', 'rarely'] })
  exerciseFrequency!: 'daily' | '3_4_per_week' | '1_2_per_week' | 'rarely';

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class UserProfileResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ enum: ['INFOTEAM', 'LOCAL'] })
  providerType!: 'INFOTEAM' | 'LOCAL';

  @ApiProperty()
  onboardingCompleted!: boolean;

  @ApiProperty({ type: UserProfileDto, nullable: true })
  profile!: UserProfileDto | null;
}
