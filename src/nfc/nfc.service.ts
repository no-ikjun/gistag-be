import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { nfcTags, places } from '../db/schema';
import { PlaceResponseDto } from '../places/dto/place-response.dto';
import { toPlaceResponse } from '../places/place.mapper';
import { NfcVerifyDto } from './dto/nfc-verify.dto';

@Injectable()
export class NfcService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async verify(dto: NfcVerifyDto): Promise<{ place: PlaceResponseDto }> {
    const rows = await this.db
      .select({ place: places })
      .from(nfcTags)
      .innerJoin(places, eq(nfcTags.placeId, places.id))
      .where(and(eq(nfcTags.tagUid, dto.tagUid), eq(nfcTags.isActive, true)))
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Unknown or inactive NFC tag');
    }

    return { place: toPlaceResponse(row.place) };
  }
}
