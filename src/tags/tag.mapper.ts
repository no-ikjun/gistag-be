import { nfcTags, places } from '../db/schema';
import {
  ResolvedPlaceDto,
  ResolvedTagDto,
} from './dto/tag-resolve-response.dto';

type TagRow = typeof nfcTags.$inferSelect;
type PlaceRow = typeof places.$inferSelect;

export function toResolvedTag(row: TagRow): ResolvedTagDto {
  const dto = new ResolvedTagDto();
  dto.id = row.id;
  dto.code = row.hardwareUid ?? row.tagCode;
  dto.status = row.status;
  return dto;
}

export function toResolvedPlace(row: PlaceRow): ResolvedPlaceDto {
  const dto = new ResolvedPlaceDto();
  dto.id = row.id;
  dto.name = row.placeName;
  dto.description = row.description;
  dto.workoutType = row.category;
  dto.latitude = row.latitude;
  dto.longitude = row.longitude;
  dto.distanceText = row.distanceText;
  dto.estimatedDurationMinutes = row.estimatedDurationMinutes;
  return dto;
}
