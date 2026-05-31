import { userProfiles } from '../db/schema';
import type { ExerciseType } from './constants/exercise-type.constants';
import { UserProfileDto } from './dto/user-profile-response.dto';

export function toUserProfileDto(
  profile: typeof userProfiles.$inferSelect,
): UserProfileDto {
  const dto = new UserProfileDto();
  dto.gender = profile.gender;
  dto.exerciseTypes = profile.exerciseTypes as ExerciseType[];
  dto.exerciseFrequency = profile.exerciseFrequency;
  dto.createdAt = profile.createdAt;
  dto.updatedAt = profile.updatedAt;
  return dto;
}
