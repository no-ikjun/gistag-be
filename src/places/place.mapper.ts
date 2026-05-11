import { places } from '../db/schema';
import { PlaceResponseDto } from './dto/place-response.dto';

type PlaceRow = typeof places.$inferSelect;

export function toPlaceResponse(
  row: PlaceRow,
  extras?: { distanceKm?: number },
): PlaceResponseDto {
  const dto = new PlaceResponseDto();
  dto.id = row.id;
  dto.placeName = row.placeName;
  dto.description = row.description;
  dto.category = row.category;
  dto.imageUrl = row.imageUrl;
  dto.latitude = row.latitude;
  dto.longitude = row.longitude;
  dto.distanceText = row.distanceText;
  dto.estimatedDurationMinutes = row.estimatedDurationMinutes;
  dto.createdAt = row.createdAt;
  if (extras?.distanceKm !== undefined) {
    dto.distanceKm = extras.distanceKm;
  }
  return dto;
}
