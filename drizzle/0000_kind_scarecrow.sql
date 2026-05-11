CREATE TABLE "nfc_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag_uid" text NOT NULL,
	"place_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nfc_tags_tag_uid_unique" UNIQUE("tag_uid")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_name" text NOT NULL,
	"description" text,
	"category" text,
	"image_url" text,
	"latitude" double precision,
	"longitude" double precision,
	"distance_text" text,
	"estimated_duration_minutes" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_recommended" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "nfc_tags" ADD CONSTRAINT "nfc_tags_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE restrict ON UPDATE no action;