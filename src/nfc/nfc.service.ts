import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { nfcTags, places } from '../db/schema';
import { IssueNfcTagResponseDto } from './dto/issue-nfc-tag-response.dto';
import { NfcTagResponseDto } from './dto/nfc-tag-response.dto';
import { RegisterNfcTagDto } from './dto/register-nfc-tag.dto';
import { UpdateNfcTagPlaceDto } from './dto/update-nfc-tag-place.dto';
import { UpdateNfcTagStatusDto } from './dto/update-nfc-tag-status.dto';
import { toNfcTagResponse } from './nfc.mapper';

@Injectable()
export class NfcService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async issue(): Promise<IssueNfcTagResponseDto> {
    const tagCode = this.generateTagCode();
    const ndefPayload = `gistag://tag/${tagCode}`;

    const rows = await this.db
      .insert(nfcTags)
      .values({
        tagCode,
        ndefPayload,
        ndefType: 'URI',
        status: 'UNASSIGNED',
      })
      .returning();

    const row = rows[0];
    const dto = new IssueNfcTagResponseDto();
    dto.tagId = row.id;
    dto.tagCode = row.tagCode;
    dto.ndefPayload = row.ndefPayload ?? ndefPayload;
    dto.ndefType = row.ndefType ?? 'URI';
    return dto;
  }

  async register(
    userId: string,
    dto: RegisterNfcTagDto,
  ): Promise<NfcTagResponseDto> {
    if (dto.placeId !== undefined) {
      await this.assertPlaceExists(dto.placeId);
    }

    const rows = await this.db
      .select()
      .from(nfcTags)
      .where(eq(nfcTags.tagCode, dto.tagCode))
      .limit(1);

    const existing = rows[0];
    const now = new Date();
    const values = {
      placeId: dto.placeId ?? null,
      status: dto.placeId === undefined ? 'UNASSIGNED' : 'ACTIVE',
      hardwareUid: dto.hardwareUid,
      ndefPayload: dto.ndefPayload,
      ndefType: dto.ndefType,
      techTypes: dto.techTypes,
      isWritable: dto.isWritable,
      maxSizeBytes: dto.maxSizeBytes,
      registeredBy: userId,
      registeredAt: now,
      activatedAt: dto.placeId === undefined ? null : now,
      updatedAt: now,
    } as const;

    if (!existing) {
      const inserted = await this.db
        .insert(nfcTags)
        .values({
          tagCode: dto.tagCode,
          ...values,
        })
        .returning();

      return toNfcTagResponse(inserted[0]);
    }

    if (existing.status === 'RETIRED') {
      throw new ConflictException('Retired NFC tag cannot be registered');
    }

    const updated = await this.db
      .update(nfcTags)
      .set(values)
      .where(eq(nfcTags.id, existing.id))
      .returning();

    return toNfcTagResponse(updated[0]);
  }

  async updatePlace(
    tagId: number,
    dto: UpdateNfcTagPlaceDto,
  ): Promise<NfcTagResponseDto> {
    await this.assertPlaceExists(dto.placeId);
    const rows = await this.db
      .update(nfcTags)
      .set({
        placeId: dto.placeId,
        status: 'ACTIVE',
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(nfcTags.id, tagId))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('NFC tag not found');
    }

    return toNfcTagResponse(row);
  }

  async updateStatus(
    tagId: number,
    dto: UpdateNfcTagStatusDto,
  ): Promise<NfcTagResponseDto> {
    const currentRows = await this.db
      .select()
      .from(nfcTags)
      .where(eq(nfcTags.id, tagId))
      .limit(1);

    const current = currentRows[0];
    if (!current) {
      throw new NotFoundException('NFC tag not found');
    }

    if (dto.status === 'ACTIVE' && current.placeId == null) {
      throw new UnprocessableEntityException(
        'NFC tag must be assigned to a place before activation',
      );
    }

    const now = new Date();
    const values = {
      status: dto.status,
      retiredAt: dto.status === 'RETIRED' ? now : null,
      activatedAt: dto.status === 'ACTIVE' ? now : current.activatedAt,
      updatedAt: now,
    };

    const rows = await this.db
      .update(nfcTags)
      .set(values)
      .where(eq(nfcTags.id, tagId))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('NFC tag not found');
    }

    return toNfcTagResponse(row);
  }

  private generateTagCode(): string {
    return `GISTAG_TAG_${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;
  }

  private async assertPlaceExists(placeId: number): Promise<void> {
    const rows = await this.db
      .select({ id: places.id })
      .from(places)
      .where(eq(places.id, placeId))
      .limit(1);

    if (!rows[0]) {
      throw new NotFoundException(`Place ${placeId} not found`);
    }
  }
}
