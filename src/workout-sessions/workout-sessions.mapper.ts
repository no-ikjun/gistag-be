import { places, nfcTags, workoutRecords, workoutSessions } from '../db/schema';
import {
  FinishedWorkoutRecordDto,
  WorkoutRewardDto,
} from './dto/finish-workout-session-response.dto';
import {
  WorkoutSessionDto,
  WorkoutSessionPlaceDto,
  WorkoutSessionStartedByTagDto,
} from './dto/workout-session-response.dto';

type PlaceRow = typeof places.$inferSelect;
type TagRow = typeof nfcTags.$inferSelect;
type SessionRow = typeof workoutSessions.$inferSelect;
type RecordRow = typeof workoutRecords.$inferSelect;

export function toWorkoutSessionDto(
  session: SessionRow,
  place: PlaceRow,
  tag?: TagRow,
): WorkoutSessionDto {
  const dto = new WorkoutSessionDto();
  dto.id = session.id;
  dto.status = session.status;
  dto.startedAt = session.startedAt;
  dto.place = toWorkoutSessionPlaceDto(place);

  if (tag) {
    const startedByTag = new WorkoutSessionStartedByTagDto();
    startedByTag.id = tag.id;
    startedByTag.code = tag.hardwareUid ?? tag.tagCode;
    dto.startedByTag = startedByTag;
  }

  return dto;
}

export function toFinishedWorkoutRecordDto(
  record: RecordRow,
  place: PlaceRow,
): FinishedWorkoutRecordDto {
  const dto = new FinishedWorkoutRecordDto();
  dto.id = record.id;
  dto.sessionId = record.sessionId;
  dto.place = toWorkoutSessionPlaceDto(place);
  dto.startedAt = record.startedAt;
  dto.finishedAt = record.finishedAt;
  dto.durationSeconds = record.durationSeconds;
  dto.earnedXp = record.earnedXp;
  return dto;
}

export function toWorkoutRewardDto(input: {
  earnedXp: number;
  totalXp: number;
  level: number;
  streakDays: number;
  streakUpdated: boolean;
}): WorkoutRewardDto {
  const dto = new WorkoutRewardDto();
  dto.earnedXp = input.earnedXp;
  dto.totalXp = input.totalXp;
  dto.level = input.level;
  dto.streakDays = input.streakDays;
  dto.streakUpdated = input.streakUpdated;
  return dto;
}

export function toWorkoutSessionPlaceDto(
  place: PlaceRow,
): WorkoutSessionPlaceDto {
  const dto = new WorkoutSessionPlaceDto();
  dto.id = place.id;
  dto.name = place.placeName;
  dto.category = place.category;
  return dto;
}
