import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import {
  nfcTags,
  places,
  userStats,
  users,
  workoutRecords,
  workoutSessions,
} from '../db/schema';
import {
  ActivePeerItemDto,
  ActivePeersResponseDto,
} from './dto/active-peers-response.dto';
import { CancelWorkoutSessionDto } from './dto/cancel-workout-session.dto';
import { FinishWorkoutSessionDto } from './dto/finish-workout-session.dto';
import { FinishWorkoutSessionResponseDto } from './dto/finish-workout-session-response.dto';
import { StartWorkoutSessionDto } from './dto/start-workout-session.dto';
import {
  ActiveWorkoutSessionResponseDto,
  StartWorkoutSessionResponseDto,
} from './dto/workout-session-response.dto';
import {
  toFinishedWorkoutRecordDto,
  toWorkoutRewardDto,
  toWorkoutSessionDto,
  toWorkoutSessionPlaceDto,
} from './workout-sessions.mapper';

const MINIMUM_DURATION_SECONDS = 60;
const XP_PER_MINUTE = 4;
const XP_PER_LEVEL = 300;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

@Injectable()
export class WorkoutSessionsService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async getActive(userId: string): Promise<ActiveWorkoutSessionResponseDto> {
    const rows = await this.db
      .select({ session: workoutSessions, place: places, tag: nfcTags })
      .from(workoutSessions)
      .innerJoin(places, eq(workoutSessions.placeId, places.id))
      .innerJoin(nfcTags, eq(workoutSessions.startedByTagId, nfcTags.id))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, 'ACTIVE'),
        ),
      )
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);

    const res = new ActiveWorkoutSessionResponseDto();
    const row = rows[0];
    res.session = row
      ? toWorkoutSessionDto(row.session, row.place, row.tag)
      : null;
    return res;
  }

  async getActivePeers(userId: string): Promise<ActivePeersResponseDto> {
    const myRows = await this.db
      .select({ session: workoutSessions, place: places })
      .from(workoutSessions)
      .innerJoin(places, eq(workoutSessions.placeId, places.id))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, 'ACTIVE'),
        ),
      )
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);

    const res = new ActivePeersResponseDto();
    const myRow = myRows[0];
    if (!myRow) {
      res.place = null;
      res.items = [];
      return res;
    }

    res.place = toWorkoutSessionPlaceDto(myRow.place);

    const now = new Date();
    const peerRows = await this.db
      .select({
        session: workoutSessions,
        user: users,
        stats: userStats,
      })
      .from(workoutSessions)
      .innerJoin(users, eq(users.id, workoutSessions.userId))
      .leftJoin(userStats, eq(userStats.userId, workoutSessions.userId))
      .where(
        and(
          eq(workoutSessions.placeId, myRow.session.placeId),
          eq(workoutSessions.status, 'ACTIVE'),
          ne(workoutSessions.userId, userId),
        ),
      )
      .orderBy(asc(workoutSessions.startedAt));

    res.items = peerRows.map(({ session, user, stats }) => {
      const item = new ActivePeerItemDto();
      item.userId = user.id;
      item.nickname = user.nickname;
      item.level = stats?.level ?? 1;
      item.totalXp = stats?.totalXp ?? 0;
      item.currentStreak = stats?.streakDays ?? 0;
      item.sessionStartedAt = session.startedAt;
      item.durationSeconds = Math.floor(
        (now.getTime() - session.startedAt.getTime()) / 1000,
      );
      return item;
    });

    return res;
  }

  async start(
    userId: string,
    dto: StartWorkoutSessionDto,
  ): Promise<StartWorkoutSessionResponseDto> {
    const active = await this.getActive(userId);
    if (active.session) {
      throw new ConflictException('Active workout session already exists');
    }

    const tag = await this.findUsableTag(dto.tagCode);
    if (tag.placeId !== dto.placeId) {
      throw new UnprocessableEntityException('Tag does not belong to place');
    }

    const place = await this.findPlace(dto.placeId);

    try {
      const rows = await this.db
        .insert(workoutSessions)
        .values({
          userId,
          placeId: dto.placeId,
          startedByTagId: tag.id,
          status: 'ACTIVE',
        })
        .returning();

      const res = new StartWorkoutSessionResponseDto();
      res.session = toWorkoutSessionDto(rows[0], place, tag);
      return res;
    } catch (err: unknown) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('Active workout session already exists');
      }
      throw err;
    }
  }

  async finish(
    userId: string,
    sessionId: string,
    dto: FinishWorkoutSessionDto,
  ): Promise<FinishWorkoutSessionResponseDto> {
    void dto.clientFinishedAt;

    const sessionRows = await this.db
      .select({ session: workoutSessions, place: places })
      .from(workoutSessions)
      .innerJoin(places, eq(workoutSessions.placeId, places.id))
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.userId, userId),
        ),
      )
      .limit(1);

    const row = sessionRows[0];
    if (!row) {
      throw new NotFoundException('Workout session not found');
    }

    if (row.session.status === 'FINISHED') {
      return this.getFinishedRecordResponse(userId, sessionId, true);
    }

    if (row.session.status === 'CANCELLED') {
      throw new ConflictException('Workout session already cancelled');
    }

    const finishedAt = new Date();
    const durationSeconds = Math.floor(
      (finishedAt.getTime() - row.session.startedAt.getTime()) / 1000,
    );

    if (durationSeconds < MINIMUM_DURATION_SECONDS) {
      throw new UnprocessableEntityException('Workout duration is too short');
    }

    const earnedXp = this.calculateXp(durationSeconds);

    const createdRecord = await this.db.transaction(async (tx) => {
      const updatedSessions = await tx
        .update(workoutSessions)
        .set({
          status: 'FINISHED',
          finishedAt,
          updatedAt: finishedAt,
        })
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.status, 'ACTIVE'),
          ),
        )
        .returning();

      if (!updatedSessions[0]) {
        return false;
      }

      await tx
        .insert(workoutRecords)
        .values({
          sessionId,
          userId,
          placeId: row.session.placeId,
          startedAt: row.session.startedAt,
          finishedAt,
          durationSeconds,
          earnedXp,
        })
        .onConflictDoNothing();

      await this.updateStats(tx, userId, earnedXp, finishedAt);
      return true;
    });

    return this.getFinishedRecordResponse(userId, sessionId, !createdRecord);
  }

  async cancel(
    userId: string,
    sessionId: string,
    dto: CancelWorkoutSessionDto,
  ): Promise<{ ok: true }> {
    void dto.reason;

    const rows = await this.db
      .update(workoutSessions)
      .set({
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, 'ACTIVE'),
        ),
      )
      .returning();

    if (!rows[0]) {
      const existing = await this.db
        .select({ id: workoutSessions.id })
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.userId, userId),
          ),
        )
        .limit(1);

      if (!existing[0]) {
        throw new NotFoundException('Workout session not found');
      }

      throw new ConflictException('Workout session is not active');
    }

    return { ok: true };
  }

  private async getFinishedRecordResponse(
    userId: string,
    sessionId: string,
    alreadyFinished: boolean,
  ): Promise<FinishWorkoutSessionResponseDto> {
    const rows = await this.db
      .select({ record: workoutRecords, place: places })
      .from(workoutRecords)
      .innerJoin(places, eq(workoutRecords.placeId, places.id))
      .where(
        and(
          eq(workoutRecords.sessionId, sessionId),
          eq(workoutRecords.userId, userId),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new ConflictException('Workout session already finished');
    }

    const statsRows = await this.db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    const stats = statsRows[0];
    const res = new FinishWorkoutSessionResponseDto();
    res.record = toFinishedWorkoutRecordDto(row.record, row.place);
    res.reward = toWorkoutRewardDto({
      earnedXp: row.record.earnedXp,
      totalXp: stats?.totalXp ?? row.record.earnedXp,
      level: stats?.level ?? this.calculateLevel(row.record.earnedXp),
      streakDays: stats?.streakDays ?? 1,
      streakUpdated: !alreadyFinished,
    });
    if (alreadyFinished) {
      res.alreadyFinished = true;
    }
    return res;
  }

  private async findUsableTag(tagCode: string) {
    const trimmed = tagCode.trim();

    // UID 기반 태그를 우선 조회하고, 없으면 NDEF tag_code로 fallback
    const byUidRows = await this.db
      .select()
      .from(nfcTags)
      .where(eq(nfcTags.hardwareUid, trimmed))
      .limit(1);

    let tag = byUidRows[0];
    if (!tag) {
      const byCodeRows = await this.db
        .select()
        .from(nfcTags)
        .where(eq(nfcTags.tagCode, trimmed))
        .limit(1);
      tag = byCodeRows[0];
    }

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.status !== 'ACTIVE' || tag.placeId == null || tag.retiredAt) {
      throw new UnprocessableEntityException('Tag is inactive');
    }

    return tag;
  }

  private async findPlace(placeId: number) {
    const rows = await this.db
      .select()
      .from(places)
      .where(eq(places.id, placeId))
      .limit(1);

    const place = rows[0];
    if (!place) {
      throw new NotFoundException(`Place ${placeId} not found`);
    }
    return place;
  }

  private async updateStats(
    tx: Parameters<Parameters<AppDatabase['transaction']>[0]>[0],
    userId: string,
    earnedXp: number,
    finishedAt: Date,
  ): Promise<void> {
    const rows = await tx
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    const current = rows[0];
    const workoutDate = toKstDateString(finishedAt);
    const streak = calculateNextStreak(
      current?.lastWorkoutDate ?? null,
      current?.streakDays ?? 0,
      workoutDate,
    );
    const totalXp = (current?.totalXp ?? 0) + earnedXp;
    const level = this.calculateLevel(totalXp);

    await tx
      .insert(userStats)
      .values({
        userId,
        totalXp,
        level,
        streakDays: streak.streakDays,
        lastWorkoutDate: workoutDate,
        updatedAt: finishedAt,
      })
      .onConflictDoUpdate({
        target: userStats.userId,
        set: {
          totalXp,
          level,
          streakDays: streak.streakDays,
          lastWorkoutDate: workoutDate,
          updatedAt: finishedAt,
        },
      });
  }

  private calculateXp(durationSeconds: number): number {
    return Math.floor((durationSeconds / 60) * XP_PER_MINUTE);
  }

  private calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / XP_PER_LEVEL) + 1;
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      !!err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    );
  }
}

function toKstDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function calculateNextStreak(
  previousDate: string | null,
  currentStreakDays: number,
  workoutDate: string,
): { streakDays: number; streakUpdated: boolean } {
  if (!previousDate) {
    return { streakDays: 1, streakUpdated: true };
  }

  if (previousDate === workoutDate) {
    return { streakDays: currentStreakDays, streakUpdated: false };
  }

  return {
    streakDays: isPreviousDay(previousDate, workoutDate)
      ? currentStreakDays + 1
      : 1,
    streakUpdated: true,
  };
}

function isPreviousDay(previousDate: string, workoutDate: string): boolean {
  const previous = new Date(`${previousDate}T00:00:00.000Z`);
  const current = new Date(`${workoutDate}T00:00:00.000Z`);
  return current.getTime() - previous.getTime() === 24 * 60 * 60 * 1000;
}
