CREATE TYPE "public"."tag_status" AS ENUM('UNASSIGNED', 'ACTIVE', 'INACTIVE', 'RETIRED');
--> statement-breakpoint
CREATE TYPE "public"."workout_session_status" AS ENUM('ACTIVE', 'FINISHED', 'CANCELLED');
--> statement-breakpoint
ALTER TABLE "nfc_tags" RENAME COLUMN "tag_uid" TO "tag_code";
--> statement-breakpoint
ALTER TABLE "nfc_tags" RENAME CONSTRAINT "nfc_tags_tag_uid_unique" TO "nfc_tags_tag_code_unique";
--> statement-breakpoint
ALTER TABLE "nfc_tags" ALTER COLUMN "place_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "status" "tag_status" DEFAULT 'UNASSIGNED' NOT NULL;
--> statement-breakpoint
UPDATE "nfc_tags"
SET "status" = CASE
  WHEN "is_active" = true THEN 'ACTIVE'::"tag_status"
  ELSE 'INACTIVE'::"tag_status"
END;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "hardware_uid" text;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "hardware_uid_hash" text;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "ndef_payload" text;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "ndef_type" text;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "tech_types" jsonb;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "is_writable" boolean;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "max_size_bytes" integer;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "registered_by" uuid;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "registered_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "activated_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "nfc_tags" SET "activated_at" = now() WHERE "status" = 'ACTIVE';
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "retired_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "nfc_tags" DROP COLUMN "is_active";
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_workout_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"place_id" integer NOT NULL,
	"started_by_tag_id" integer NOT NULL,
	"status" "workout_session_status" DEFAULT 'ACTIVE' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"place_id" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"earned_xp" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_records_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD CONSTRAINT "nfc_tags_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_started_by_tag_id_nfc_tags_id_fk" FOREIGN KEY ("started_by_tag_id") REFERENCES "public"."nfc_tags"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_records" ADD CONSTRAINT "workout_records_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_records" ADD CONSTRAINT "workout_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_records" ADD CONSTRAINT "workout_records_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "workout_sessions_user_status_idx" ON "workout_sessions" USING btree ("user_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX "workout_sessions_one_active_per_user_idx" ON "workout_sessions" USING btree ("user_id") WHERE "status" = 'ACTIVE';
--> statement-breakpoint
CREATE INDEX "workout_records_user_started_at_idx" ON "workout_records" USING btree ("user_id","started_at");
