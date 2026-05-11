import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
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
  users,
  places,
  nfcTags,
  placesRelations,
  nfcTagsRelations,
};
