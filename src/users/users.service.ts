import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { DRIZZLE } from '../db/database.constants';
import { userProfiles, users } from '../db/schema';
import { EXERCISE_TYPES } from './constants/exercise-type.constants';
import type { SubmitOnboardingDto } from './dto/submit-onboarding.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { toUserProfileDto } from './users.mapper';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  async submitOnboarding(
    userId: string,
    dto: SubmitOnboardingDto,
  ): Promise<UserProfileResponseDto> {
    const existing = await this.db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (existing[0]) {
      throw new ConflictException('Onboarding already completed');
    }

    const now = new Date();
    const normalizedExerciseTypes = this.normalizeExerciseTypes(
      dto.exerciseTypes,
    );

    await this.db.insert(userProfiles).values({
      userId,
      gender: dto.gender,
      exerciseTypes: normalizedExerciseTypes,
      exerciseFrequency: dto.exerciseFrequency,
      createdAt: now,
      updatedAt: now,
    });

    return this.getProfile(userId);
  }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const rows = await this.db
      .select({ user: users, profile: userProfiles })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    const row = rows[0];
    if (!row?.user) {
      throw new UnauthorizedException('User not found');
    }

    const res = new UserProfileResponseDto();
    res.userId = row.user.id;
    res.nickname = row.user.nickname;
    res.email = row.user.email;
    res.providerType = row.user.providerType;
    res.onboardingCompleted = !!row.profile;
    res.profile = row.profile ? toUserProfileDto(row.profile) : null;
    return res;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    if (
      dto.gender === undefined &&
      dto.exerciseTypes === undefined &&
      dto.exerciseFrequency === undefined
    ) {
      throw new BadRequestException('At least one field is required');
    }

    const now = new Date();
    const update: Partial<typeof userProfiles.$inferInsert> = {
      updatedAt: now,
    };
    if (dto.gender !== undefined) {
      update.gender = dto.gender;
    }
    if (dto.exerciseFrequency !== undefined) {
      update.exerciseFrequency = dto.exerciseFrequency;
    }
    if (dto.exerciseTypes !== undefined) {
      update.exerciseTypes = this.normalizeExerciseTypes(dto.exerciseTypes);
    }

    const updated = await this.db
      .update(userProfiles)
      .set(update)
      .where(eq(userProfiles.userId, userId))
      .returning({ userId: userProfiles.userId });

    if (!updated[0]) {
      throw new NotFoundException('Onboarding not completed');
    }

    return this.getProfile(userId);
  }

  private normalizeExerciseTypes(
    exerciseTypes: string[],
  ): (typeof EXERCISE_TYPES)[number][] {
    const set = new Set(exerciseTypes);
    const res = [...set];
    for (const v of res) {
      if (!EXERCISE_TYPES.includes(v as (typeof EXERCISE_TYPES)[number])) {
        throw new BadRequestException('Invalid exerciseTypes');
      }
    }
    return res as (typeof EXERCISE_TYPES)[number][];
  }
}
