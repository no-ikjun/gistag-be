import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { nfcTags, places } from '../db/schema';
import {
  AdminRegisteredPlaceDto,
  AdminRegisteredTagDto,
  RegisterAdminNfcTagResponseDto,
} from './dto/register-admin-nfc-tag-response.dto';
import { RegisterAdminNfcTagDto } from './dto/register-admin-nfc-tag.dto';

@Injectable()
export class AdminNfcTagsService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async register(
    userId: string,
    dto: RegisterAdminNfcTagDto,
  ): Promise<RegisterAdminNfcTagResponseDto> {
    const hardwareUid = dto.hardwareUid.trim();
    if (!hardwareUid) {
      throw new ConflictException('hardwareUid is required');
    }

    const result = await this.db.transaction(async (tx) => {
      const placeValues: typeof places.$inferInsert = {
        placeName: dto.place.name,
        description: dto.place.description ?? null,
        category: dto.place.workoutType ?? null,
        latitude: dto.place.latitude ?? null,
        longitude: dto.place.longitude ?? null,
        imageUrl: dto.place.imageUrl ?? null,
        distanceText: dto.place.distanceText ?? null,
        estimatedDurationMinutes: dto.place.estimatedDurationMinutes ?? null,
      };
      if (dto.place.sortOrder !== undefined) {
        placeValues.sortOrder = dto.place.sortOrder;
      }
      if (dto.place.isRecommended !== undefined) {
        placeValues.isRecommended = dto.place.isRecommended;
      }

      const [createdPlace] = await tx
        .insert(places)
        .values(placeValues)
        .returning();

      if (!createdPlace) {
        throw new ConflictException('Failed to create place');
      }

      const existingByUid = await tx
        .select()
        .from(nfcTags)
        .where(eq(nfcTags.hardwareUid, hardwareUid))
        .limit(1);

      const existingByCode = existingByUid[0]
        ? null
        : ((
            await tx
              .select()
              .from(nfcTags)
              .where(eq(nfcTags.tagCode, hardwareUid))
              .limit(1)
          )[0] ?? null);

      const existing = existingByUid[0] ?? existingByCode;
      const now = new Date();

      const meta = dto.tagMetadata;

      if (existing) {
        if (existing.status === 'RETIRED') {
          throw new ConflictException(
            'Retired NFC tag cannot be re-registered',
          );
        }

        const [updated] = await tx
          .update(nfcTags)
          .set({
            placeId: createdPlace.id,
            status: 'ACTIVE',
            hardwareUid,
            hardwareUidHash: meta?.hardwareUidHash ?? existing.hardwareUidHash,
            ndefPayload: meta?.ndefPayload ?? existing.ndefPayload,
            ndefType: meta?.ndefType ?? existing.ndefType,
            techTypes: meta?.technologies ?? existing.techTypes,
            isWritable: meta?.isWritable ?? existing.isWritable,
            maxSizeBytes: meta?.maxSizeBytes ?? existing.maxSizeBytes,
            registeredBy: userId,
            registeredAt: existing.registeredAt ?? now,
            activatedAt: now,
            updatedAt: now,
          })
          .where(eq(nfcTags.id, existing.id))
          .returning();

        return { tag: updated, place: createdPlace };
      }

      const [createdTag] = await tx
        .insert(nfcTags)
        .values({
          tagCode: hardwareUid,
          hardwareUid,
          hardwareUidHash: meta?.hardwareUidHash ?? null,
          placeId: createdPlace.id,
          status: 'ACTIVE',
          ndefPayload: meta?.ndefPayload ?? null,
          ndefType: meta?.ndefType ?? null,
          techTypes: meta?.technologies ?? null,
          isWritable: meta?.isWritable ?? null,
          maxSizeBytes: meta?.maxSizeBytes ?? null,
          registeredBy: userId,
          registeredAt: now,
          activatedAt: now,
        })
        .returning();

      return { tag: createdTag, place: createdPlace };
    });

    const tagDto = new AdminRegisteredTagDto();
    tagDto.id = result.tag.id;
    tagDto.hardwareUid = result.tag.hardwareUid ?? hardwareUid;
    tagDto.status = result.tag.status;

    const placeDto = new AdminRegisteredPlaceDto();
    placeDto.id = result.place.id;
    placeDto.name = result.place.placeName;
    placeDto.latitude = result.place.latitude;
    placeDto.longitude = result.place.longitude;

    const res = new RegisterAdminNfcTagResponseDto();
    res.tag = tagDto;
    res.place = placeDto;
    return res;
  }
}
