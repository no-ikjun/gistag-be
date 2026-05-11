import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { nfcTags, places } from '../db/schema';
import { toPlaceResponse } from '../places/place.mapper';
import { NfcVerifyDto } from './dto/nfc-verify.dto';
import { NfcVerifyResponseDto } from './dto/nfc-verify-response.dto';

@Injectable()
export class NfcService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async verify(dto: NfcVerifyDto): Promise<NfcVerifyResponseDto> {
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

    const res = new NfcVerifyResponseDto();
    res.place = toPlaceResponse(row.place);
    return res;
  }
}
