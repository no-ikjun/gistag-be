import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { nfcTags, places } from '../db/schema';
import { TagResolveDto } from './dto/tag-resolve.dto';
import { TagResolveResponseDto } from './dto/tag-resolve-response.dto';
import { toResolvedPlace, toResolvedTag } from './tag.mapper';

@Injectable()
export class TagsService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async resolve(dto: TagResolveDto): Promise<TagResolveResponseDto> {
    const hardwareUid = dto.hardwareUid.trim();

    const byUidRows = await this.db
      .select()
      .from(nfcTags)
      .where(eq(nfcTags.hardwareUid, hardwareUid))
      .limit(1);

    let tag = byUidRows[0];
    if (!tag) {
      // 레거시 데이터 호환: hardwareUid로 못 찾으면 tagCode로도 한 번 시도
      const byCodeRows = await this.db
        .select()
        .from(nfcTags)
        .where(eq(nfcTags.tagCode, hardwareUid))
        .limit(1);
      tag = byCodeRows[0];
    }

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.status === 'INACTIVE' || tag.status === 'RETIRED') {
      throw new UnprocessableEntityException('Tag is inactive');
    }

    if (tag.status === 'UNASSIGNED' || tag.placeId == null) {
      throw new UnprocessableEntityException('Tag is not assigned to a place');
    }

    const placeRows = await this.db
      .select()
      .from(places)
      .where(eq(places.id, tag.placeId))
      .limit(1);

    const place = placeRows[0];
    if (!place) {
      throw new UnprocessableEntityException('Tag is not assigned to a place');
    }

    const res = new TagResolveResponseDto();
    res.tag = toResolvedTag(tag);
    res.place = toResolvedPlace(place);
    res.canStartWorkout = true;
    res.blockedReason = null;
    return res;
  }
}
