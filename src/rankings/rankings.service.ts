import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, gt, or, sql } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { userStats, users } from '../db/schema';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import {
  RankingItemDto,
  RankingsResponseDto,
} from './dto/rankings-response.dto';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

@Injectable()
export class RankingsService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async findRankings(
    userId: string,
    query: RankingsQueryDto,
  ): Promise<RankingsResponseDto> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const offset = query.offset ?? DEFAULT_OFFSET;

    const [totalRows, pageRows, myRow] = await Promise.all([
      this.db.select({ count: count() }).from(userStats),
      this.db
        .select({
          userId: users.id,
          nickname: users.nickname,
          level: userStats.level,
          totalXp: userStats.totalXp,
          streakDays: userStats.streakDays,
        })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .orderBy(desc(userStats.totalXp), asc(userStats.userId))
        .limit(limit)
        .offset(offset),
      this.db
        .select({
          userId: users.id,
          nickname: users.nickname,
          level: userStats.level,
          totalXp: userStats.totalXp,
          streakDays: userStats.streakDays,
        })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(eq(userStats.userId, userId))
        .limit(1),
    ]);

    const res = new RankingsResponseDto();
    res.total = totalRows[0]?.count ?? 0;
    res.items = pageRows.map((row, index) =>
      this.toRankingItem(row, offset + index + 1),
    );

    const myStats = myRow[0];
    if (!myStats) {
      res.me = null;
      return res;
    }

    const rankRows = await this.db
      .select({ count: count() })
      .from(userStats)
      .where(
        or(
          gt(userStats.totalXp, myStats.totalXp),
          and(
            eq(userStats.totalXp, myStats.totalXp),
            sql`${userStats.userId} < ${myStats.userId}`,
          ),
        ),
      );

    res.me = this.toRankingItem(myStats, (rankRows[0]?.count ?? 0) + 1);
    return res;
  }

  private toRankingItem(
    row: {
      userId: string;
      nickname: string;
      level: number;
      totalXp: number;
      streakDays: number;
    },
    rank: number,
  ): RankingItemDto {
    const item = new RankingItemDto();
    item.rank = rank;
    item.userId = row.userId;
    item.nickname = row.nickname;
    item.level = row.level;
    item.totalXp = row.totalXp;
    item.currentStreak = row.streakDays;
    return item;
  }
}
