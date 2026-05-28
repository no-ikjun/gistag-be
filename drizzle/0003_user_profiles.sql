CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'undisclosed');
--> statement-breakpoint
CREATE TYPE "public"."exercise_frequency" AS ENUM(
  'daily',
  '3_4_per_week',
  '1_2_per_week',
  'rarely'
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"gender" "gender" NOT NULL,
	"exercise_types" text[] NOT NULL,
	"exercise_frequency" "exercise_frequency" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;