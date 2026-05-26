import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { places } from '../db/schema';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { RecommendedQueryDto } from './dto/recommended-query.dto';
import { PlaceResponseDto } from './dto/place-response.dto';
import { toPlaceResponse } from './place.mapper';

const DEFAULT_LIMIT = 20;
const EARTH_RADIUS_KM = 6371;

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

@Injectable()
export class PlacesService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async findNearby(query: NearbyQueryDto): Promise<PlaceResponseDto[]> {
    const rows = await this.db
      .select()
      .from(places)
      .where(and(isNotNull(places.latitude), isNotNull(places.longitude)));

    return rows
      .map((row) => ({
        row,
        distanceKm: haversineKm(
          query.lat,
          query.lng,
          row.latitude!,
          row.longitude!,
        ),
      }))
      .filter(({ distanceKm }) => distanceKm <= query.radius)
      .sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.row.sortOrder !== b.row.sortOrder) {
          return a.row.sortOrder - b.row.sortOrder;
        }
        return a.row.id - b.row.id;
      })
      .map(({ row, distanceKm }) => toPlaceResponse(row, { distanceKm }));
  }

  async findRecommended(
    query: RecommendedQueryDto,
  ): Promise<PlaceResponseDto[]> {
    const limit = query.limit ?? DEFAULT_LIMIT;

    if (query.lat !== undefined && query.lng !== undefined) {
      const rows = await this.db
        .select()
        .from(places)
        .where(eq(places.isRecommended, true));

      const withDistance = rows.map((row) => {
        if (row.latitude == null || row.longitude == null) {
          return { row, distanceKm: Number.POSITIVE_INFINITY };
        }
        return {
          row,
          distanceKm: haversineKm(
            query.lat!,
            query.lng!,
            row.latitude,
            row.longitude,
          ),
        };
      });

      withDistance.sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.row.sortOrder !== b.row.sortOrder) {
          return a.row.sortOrder - b.row.sortOrder;
        }
        return a.row.id - b.row.id;
      });

      return withDistance.slice(0, limit).map(({ row, distanceKm }) =>
        toPlaceResponse(row, {
          distanceKm:
            distanceKm === Number.POSITIVE_INFINITY ? undefined : distanceKm,
        }),
      );
    }

    const rows = await this.db
      .select()
      .from(places)
      .where(eq(places.isRecommended, true))
      .orderBy(asc(places.sortOrder), asc(places.id))
      .limit(limit);

    return rows.map((row) => toPlaceResponse(row));
  }

  async findOne(id: number): Promise<PlaceResponseDto> {
    const rows = await this.db
      .select()
      .from(places)
      .where(eq(places.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new NotFoundException(`Place ${id} not found`);
    }

    return toPlaceResponse(row);
  }
}
