import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const providerTypeEnum = pgEnum('provider_type', ['INFOTEAM', 'LOCAL']);
export const tagStatusEnum = pgEnum('tag_status', [
  'UNASSIGNED',
  'ACTIVE',
  'INACTIVE',
  'RETIRED',
]);
export const workoutSessionStatusEnum = pgEnum('workout_session_status', [
  'ACTIVE',
  'FINISHED',
  'CANCELLED',
]);
export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'other',
  'undisclosed',
]);
export const exerciseFrequencyEnum = pgEnum('exercise_frequency', [
  'daily',
  '3_4_per_week',
  '1_2_per_week',
  'rarely',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    providerType: providerTypeEnum('provider_type').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    nickname: text('nickname').notNull(),
    email: text('email'),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.providerType, t.providerUserId)],
);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const places = pgTable('places', {
  id: serial('id').primaryKey(),
  placeName: text('place_name').notNull(),
  description: text('description'),
  category: text('category'),
  imageUrl: text('image_url'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  distanceText: text('distance_text'),
  estimatedDurationMinutes: integer('estimated_duration_minutes'),
  sortOrder: integer('sort_order').notNull().default(0),
  isRecommended: boolean('is_recommended').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const nfcTags = pgTable('nfc_tags', {
  id: serial('id').primaryKey(),
  tagCode: text('tag_code').notNull().unique(),
  placeId: integer('place_id').references(() => places.id, {
    onDelete: 'restrict',
  }),
  status: tagStatusEnum('status').notNull().default('UNASSIGNED'),
  hardwareUid: text('hardware_uid'),
  hardwareUidHash: text('hardware_uid_hash'),
  ndefPayload: text('ndef_payload'),
  ndefType: text('ndef_type'),
  techTypes: jsonb('tech_types').$type<string[]>(),
  isWritable: boolean('is_writable'),
  maxSizeBytes: integer('max_size_bytes'),
  registeredBy: uuid('registered_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  registeredAt: timestamp('registered_at', { withTimezone: true }),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  retiredAt: timestamp('retired_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workoutSessions = pgTable(
  'workout_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id')
      .notNull()
      .references(() => places.id, { onDelete: 'restrict' }),
    startedByTagId: integer('started_by_tag_id')
      .notNull()
      .references(() => nfcTags.id, { onDelete: 'restrict' }),
    status: workoutSessionStatusEnum('status').notNull().default('ACTIVE'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('workout_sessions_user_status_idx').on(t.userId, t.status),
    uniqueIndex('workout_sessions_one_active_per_user_idx')
      .on(t.userId)
      .where(sql`${t.status} = 'ACTIVE'`),
  ],
);

export const workoutRecords = pgTable(
  'workout_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .unique()
      .references(() => workoutSessions.id, { onDelete: 'restrict' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id')
      .notNull()
      .references(() => places.id, { onDelete: 'restrict' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }).notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    earnedXp: integer('earned_xp').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('workout_records_user_started_at_idx').on(t.userId, t.startedAt),
  ],
);

export const userStats = pgTable('user_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalXp: integer('total_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  streakDays: integer('streak_days').notNull().default(0),
  lastWorkoutDate: date('last_workout_date'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  gender: genderEnum('gender').notNull(),
  exerciseTypes: text('exercise_types').array().notNull(),
  exerciseFrequency: exerciseFrequencyEnum('exercise_frequency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  refreshTokens: many(refreshTokens),
  nfcTags: many(nfcTags),
  workoutSessions: many(workoutSessions),
  workoutRecords: many(workoutRecords),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const placesRelations = relations(places, ({ many }) => ({
  nfcTags: many(nfcTags),
  workoutSessions: many(workoutSessions),
  workoutRecords: many(workoutRecords),
}));

export const nfcTagsRelations = relations(nfcTags, ({ one }) => ({
  place: one(places, {
    fields: [nfcTags.placeId],
    references: [places.id],
  }),
  registeredByUser: one(users, {
    fields: [nfcTags.registeredBy],
    references: [users.id],
  }),
}));

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [workoutSessions.userId],
      references: [users.id],
    }),
    place: one(places, {
      fields: [workoutSessions.placeId],
      references: [places.id],
    }),
    startedByTag: one(nfcTags, {
      fields: [workoutSessions.startedByTagId],
      references: [nfcTags.id],
    }),
  }),
);

export const workoutRecordsRelations = relations(workoutRecords, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [workoutRecords.sessionId],
    references: [workoutSessions.id],
  }),
  user: one(users, {
    fields: [workoutRecords.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [workoutRecords.placeId],
    references: [places.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const schema = {
  providerTypeEnum,
  tagStatusEnum,
  workoutSessionStatusEnum,
  genderEnum,
  exerciseFrequencyEnum,
  users,
  refreshTokens,
  places,
  nfcTags,
  workoutSessions,
  workoutRecords,
  userStats,
  userProfiles,
  usersRelations,
  refreshTokensRelations,
  placesRelations,
  nfcTagsRelations,
  workoutSessionsRelations,
  workoutRecordsRelations,
  userStatsRelations,
  userProfilesRelations,
};
