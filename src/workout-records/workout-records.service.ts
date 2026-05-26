import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { places, workoutRecords } from '../db/schema';
import { RecentWorkoutRecordsQueryDto } from './dto/recent-workout-records-query.dto';
import {
  RecentWorkoutRecordItemDto,
  RecentWorkoutRecordsResponseDto,
} from './dto/recent-workout-records-response.dto';

const DEFAULT_RECENT_LIMIT = 5;

@Injectable()
export class WorkoutRecordsService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async findRecent(
    userId: string,
    query: RecentWorkoutRecordsQueryDto,
  ): Promise<RecentWorkoutRecordsResponseDto> {
    const rows = await this.db
      .select({ record: workoutRecords, place: places })
      .from(workoutRecords)
      .innerJoin(places, eq(workoutRecords.placeId, places.id))
      .where(eq(workoutRecords.userId, userId))
      .orderBy(desc(workoutRecords.startedAt))
      .limit(query.limit ?? DEFAULT_RECENT_LIMIT);

    const res = new RecentWorkoutRecordsResponseDto();
    res.items = rows.map(({ record, place }) => {
      const item = new RecentWorkoutRecordItemDto();
      item.id = record.id;
      item.placeName = place.placeName;
      item.startedAt = record.startedAt;
      item.durationSeconds = record.durationSeconds;
      item.earnedXp = record.earnedXp;
      return item;
    });
    return res;
  }
}
