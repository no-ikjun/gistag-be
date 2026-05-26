CREATE TYPE "public"."provider_type" AS ENUM('INFOTEAM', 'LOCAL');
--> statement-breakpoint
DROP TABLE IF EXISTS "refresh_tokens";
--> statement-breakpoint
DROP TABLE IF EXISTS "users";
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_type" "provider_type" NOT NULL,
	"provider_user_id" text NOT NULL,
	"nickname" text NOT NULL,
	"email" text,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_provider_type_provider_user_id_unique" UNIQUE("provider_type","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
