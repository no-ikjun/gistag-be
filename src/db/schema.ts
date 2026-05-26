import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const providerTypeEnum = pgEnum('provider_type', ['INFOTEAM', 'LOCAL']);

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
  tagUid: text('tag_uid').notNull().unique(),
  placeId: integer('place_id')
    .notNull()
    .references(() => places.id, { onDelete: 'restrict' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const placesRelations = relations(places, ({ many }) => ({
  nfcTags: many(nfcTags),
}));

export const nfcTagsRelations = relations(nfcTags, ({ one }) => ({
  place: one(places, {
    fields: [nfcTags.placeId],
    references: [places.id],
  }),
}));

export const schema = {
  providerTypeEnum,
  users,
  refreshTokens,
  places,
  nfcTags,
  usersRelations,
  refreshTokensRelations,
  placesRelations,
  nfcTagsRelations,
};
