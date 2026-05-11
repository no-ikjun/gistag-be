export class PlaceResponseDto {
  id!: number;
  placeName!: string;
  description!: string | null;
  category!: string | null;
  imageUrl!: string | null;
  latitude!: number | null;
  longitude!: number | null;
  distanceText!: string | null;
  estimatedDurationMinutes!: number | null;
  createdAt!: Date;
  distanceKm?: number;
}
